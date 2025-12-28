let typingTimer;
let doneTypingInterval = 1000;
$('#search').keyup(function () {
    clearTimeout(typingTimer);
    if ($('#search').val()) {
        typingTimer = setTimeout(ready4Search, doneTypingInterval);
    }
});
$('body').on('click', '.cancel_search', function () {
    $('#search').val('');
    $('#headline .search-results').removeClass('active');
})
function ready4Search() {
    var q = $('#search').val();
    $('#headline .search-results .tab[data-tab=one]').removeClass('loading');
    $('#headline .search-results .tab[data-tab=one]').addClass('loading');
    if (q.length > 2) {
        $('#headline .search-results').addClass('active');

    } else {
        $('#headline .search-results').removeClass('active');
        return false;
    }

    var csrf_name = $('#csrf_token_name').val();
    var csrf_token = $('#csrf_token_hash').val();
    if (q.length >= 3) {
        $.ajax({
            type: 'GET',
            url: baseUrl + 'ajax/search_all',
            data: 'q=' + q + '&' + csrf_name + '=' + csrf_token,
            dataType: "JSON",
            error: function (hata) {
                console.log(hata);
            },
            success: function (data) {

                $('#headline .search-results .tab').removeClass('loading');
                $('#csrf_token_name').val(data.csrf_name);
                $('#csrf_token_hash').val(data.csrf);
                if (data.status == 'success') {
                    $('div.bottom.segment[data-tab=one]').html(data.all);
                    $('div.bottom.segment[data-tab=two]').html(data.hizmet);
                    $('div.bottom.segment[data-tab=three]').html(data.project);
                    $('div.bottom.segment[data-tab=four]').html(data.document);
                    $('div.bottom.segment[data-tab=five]').html(data.other);
                }
                if (data.status == 'error') {
                    $('.results').html(data.datas);
                }
            }
        });
    }
    return false;
}




function myMonth(a) {
    var months = [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12'
    ];
    return months[a];
}

