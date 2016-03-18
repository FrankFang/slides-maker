!(function($){
    $(document).on('keydown', function(e){
        switch(e.keyCode){
            case 39:
            case 40:
                console.log('next')
                break;
            case 37:
            case 38:
                console.log('prev')
                break;
        }
    })
})(jQuery)
