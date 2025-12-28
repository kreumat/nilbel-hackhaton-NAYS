import os
os.environ['CUDA_VISIBLE_DEVICES'] = ''  # Disable GPU to ensure CPU execution

import cv2
import numpy as np
from ultralytics import YOLO
import argparse
import time
import json
import os
from datetime import datetime

# ==================== DATA LOGGING CONFIG ====================
# Path to the data.json file (relative to this script's location)
DATA_JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'nays', 'data.json')
TARGET_VENUE_NAME = "NİLBEL 29 Ekim Kafe"
LOG_INTERVAL_SECONDS = 2 * 60  # Logging interval in seconds

def load_venue_data():
    """Load venue data from data.json"""
    try:
        with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"[ERROR] Failed to load data.json: {e}")
        return None

def save_venue_data(data):
    """Save venue data back to data.json"""
    try:
        with open(DATA_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except IOError as e:
        print(f"[ERROR] Failed to save data.json: {e}")
        return False

def get_target_venue(data):
    """Find the target venue by name and return (venue_object, index)"""
    if data is None:
        return None, -1
    for idx, venue in enumerate(data):
        if venue.get('venue_name') == TARGET_VENUE_NAME:
            return venue, idx
    print(f"[WARNING] Venue '{TARGET_VENUE_NAME}' not found in data.json")
    return None, -1

def append_occupancy_log(current_count, max_capacity):
    """Append a new log entry to the target venue's occupancy_logs"""
    data = load_venue_data()
    venue, idx = get_target_venue(data)
    
    if venue is None:
        return False
    
    # Create new log entry
    now = datetime.now()
    occupancy_rate = round((current_count / max_capacity) * 100) if max_capacity > 0 else 0
    
    new_entry = {
        "date": now.strftime("%d.%m.%Y"),
        "time": now.strftime("%H:%M"),
        "visitor_count": current_count,
        "occupancy_rate": occupancy_rate
    }
    
    # Append to occupancy_logs
    if 'occupancy_logs' not in venue:
        venue['occupancy_logs'] = []
    venue['occupancy_logs'].append(new_entry)
    
    # Update data and save
    data[idx] = venue
    if save_venue_data(data):
        print(f"[LOG] Saved: {new_entry}")
        return True
    return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=str, default='test_video.mp4', help='Path to video file')
    parser.add_argument('--no-display', action='store_true', help='Disable display for headless testing')
    args = parser.parse_args()

    # Load YOLOv8 Nano model for person detection
    model = YOLO('yolov8n.pt')

    # Open video file (not webcam)
    cap = cv2.VideoCapture(args.source)
    if not cap.isOpened():
        print(f"Error: Could not open video {args.source}")
        return

    # Video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # State variables for tracking person positions relative to door line
    track_side = {}
    
    # Calibration configuration
    calibration_frames_limit = 60
    
    frame_count = 0
    is_calibrating = True
    
    line_orientation = None 
    line_pos = 0
    
    # Collected data for calibration
    calibration_tracks = {}
    accumulated_dx = 0
    accumulated_dy = 0
    all_centroids_x = []
    all_centroids_y = []
    
    # Counts
    count_in = 0
    count_out = 0
    current_count = 47

    # ==================== DATA LOGGING SETUP ====================
    # Load max_capacity from data.json at startup
    max_capacity = 80  # Default fallback
    venue_data = load_venue_data()
    venue, _ = get_target_venue(venue_data)
    if venue:
        max_capacity = venue.get('max_capacity', 80)
        print(f"[LOG] Loaded max_capacity: {max_capacity} for '{TARGET_VENUE_NAME}'")
    else:
        print(f"[WARNING] Using default max_capacity: {max_capacity}")
    
    # Non-blocking timer for periodic data logging
    last_log_time = time.time()
    print(f"[LOG] Logging interval: {LOG_INTERVAL_SECONDS}s ({LOG_INTERVAL_SECONDS // 60} minutes)")

    print(f"Starting processing. Video: {width}x{height} @ {fps}fps")
    
    frame_interval = 1  # Process every frame for maximum accuracy

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        frame_count += 1
        if frame_count % frame_interval != 0:
             continue
        
        # Run YOLOv8 tracking for person detection (class 0)
        results = model.track(frame, persist=True, classes=[0], conf=0.25, verbose=False)

        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()

            for box, track_id in zip(boxes, track_ids):
                x1, y1, x2, y2 = box
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)

                # Draw bounding box and centroid
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 255), 2)
                cv2.circle(frame, (cx, cy), 4, (255, 0, 0), -1)

                if is_calibrating:
                    # Calibration Phase
                    if track_id not in calibration_tracks:
                        calibration_tracks[track_id] = []
                    calibration_tracks[track_id].append((cx, cy))
                    
                    if len(calibration_tracks[track_id]) > 1:
                        prev_cx, prev_cy = calibration_tracks[track_id][-2]
                        dx = cx - prev_cx
                        dy = cy - prev_cy
                        accumulated_dx += abs(dx)
                        accumulated_dy += abs(dy)
                        all_centroids_x.append(cx)
                        all_centroids_y.append(cy)

                else:
                    # Counting logic: track which side of the door line each person is on
                    current_side = None
                    
                    if line_orientation == 'horizontal':
                        if cy < line_pos:
                            current_side = 'UP'
                        else:
                            current_side = 'DOWN'
                    elif line_orientation == 'vertical':
                         if cx < line_pos:
                             current_side = 'LEFT'
                         else:
                             current_side = 'RIGHT'
                    
                    # Check for side switch
                    if track_id in track_side:
                         last_side = track_side[track_id]
                         
                         if line_orientation == 'horizontal':
                             # Person crossed from UP to DOWN (entering)
                             if last_side == 'UP' and current_side == 'DOWN':
                                 count_in += 1
                                 current_count += 1
                                 track_side[track_id] = current_side 
                             # Person crossed from DOWN to UP (exiting)
                             elif last_side == 'DOWN' and current_side == 'UP':
                                 count_out += 1
                                 current_count -= 1
                                 track_side[track_id] = current_side
                                 
                         elif line_orientation == 'vertical':
                             # Person crossed from LEFT to RIGHT (entering)
                             if last_side == 'LEFT' and current_side == 'RIGHT':
                                 count_in += 1
                                 current_count += 1
                                 track_side[track_id] = current_side
                             # Person crossed from RIGHT to LEFT (exiting)
                             elif last_side == 'RIGHT' and current_side == 'LEFT':
                                 count_out += 1
                                 current_count -= 1
                                 track_side[track_id] = current_side
                    else:
                        # Initialize side
                        track_side[track_id] = current_side

        # Calibration Logic
        if is_calibrating:
            unique_tracks = len(calibration_tracks)
            status_text = f"CALIBRATING FLOW... {frame_count}/{calibration_frames_limit}"
            cv2.putText(frame, status_text, (20, height - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            
            # Complete calibration after frame limit is reached
            if frame_count >= calibration_frames_limit:
                is_calibrating = False
                
                # Determine door line orientation based on movement patterns
                if accumulated_dx > accumulated_dy:
                    line_orientation = 'vertical'
                    if all_centroids_x:
                        line_pos = int(np.mean(all_centroids_x))
                    else:
                         line_pos = width // 2
                else:
                    line_orientation = 'horizontal'
                    if all_centroids_y:
                         line_pos = int(np.mean(all_centroids_y))
                    else:
                         line_pos = height // 2
                
                print(f"Calibration Complete. Orientation: {line_orientation.upper()}, Position: {line_pos}")
                
                # Process tracks collected during calibration
                print("Processing retroactive counts...")
                for tid, points in calibration_tracks.items():
                    start_side = None
                    end_side = None
                    
                    # Determine start side (first point)
                    start_p = points[0]
                    if line_orientation == 'horizontal':
                        if start_p[1] < line_pos: start_side = 'UP'
                        else: start_side = 'DOWN'
                    elif line_orientation == 'vertical':
                        if start_p[0] < line_pos: start_side = 'LEFT'
                        else: start_side = 'RIGHT'
                    
                    # Determine end side (last point)
                    end_p = points[-1]
                    if line_orientation == 'horizontal':
                        if end_p[1] < line_pos: end_side = 'UP'
                        else: end_side = 'DOWN'
                    elif line_orientation == 'vertical':
                        if end_p[0] < line_pos: end_side = 'LEFT'
                        else: end_side = 'RIGHT'
                    
                    # Set initial tracking side for continued monitoring
                    if end_side:
                         track_side[tid] = end_side

                    # Register crossing if person moved to opposite side
                    if start_side and end_side and start_side != end_side:
                         if line_orientation == 'horizontal':
                             if start_side == 'UP' and end_side == 'DOWN':
                                 count_in += 1
                                 current_count += 1
                             elif start_side == 'DOWN' and end_side == 'UP':
                                 count_out += 1
                                 current_count -= 1
                         elif line_orientation == 'vertical':
                             if start_side == 'LEFT' and end_side == 'RIGHT':
                                 count_in += 1
                                 current_count += 1
                             elif start_side == 'RIGHT' and end_side == 'LEFT':
                                 count_out += 1
                                 current_count -= 1
                
                # Clear calibration data
                calibration_tracks = {}

        else:
            # Draw door line on frame
            if line_orientation == 'horizontal':
                cv2.line(frame, (0, line_pos), (width, line_pos), (0, 255, 0), 2)
                cv2.putText(frame, "DOOR LINE (H)", (10, line_pos - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            elif line_orientation == 'vertical':
                cv2.line(frame, (line_pos, 0), (line_pos, height), (0, 255, 0), 2)
                cv2.putText(frame, "DOOR LINE (V)", (line_pos + 10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Display counts
            cv2.putText(frame, f"Count: {current_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(frame, f"In: {count_in}", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Out: {count_out}", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            # ==================== NON-BLOCKING DATA LOGGING ====================
            current_time = time.time()
            if current_time - last_log_time >= LOG_INTERVAL_SECONDS:
                # Log current occupancy data to JSON file
                try:
                    append_occupancy_log(current_count, max_capacity)
                    last_log_time = current_time
                except Exception as e:
                    print(f"[ERROR] Logging failed: {e}")
            
            # Display countdown to next log entry
            time_until_log = int(LOG_INTERVAL_SECONDS - (current_time - last_log_time))
            cv2.putText(frame, f"Next log: {time_until_log}s", (20, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        if not args.no_display:
            cv2.imshow("Person Counting", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"Finished. Final Count: {current_count}. In: {count_in}, Out: {count_out}")

if __name__ == "__main__":
    main()
