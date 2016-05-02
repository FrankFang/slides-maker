/*jshint -W070 */
/*globals jQuery*/
var app = {}

!(function($) {
    app.MakeSlides = MakeSlides

    function MakeSlides(slidesContainer, options) {
        this.$container = $(slidesContainer)
        this.index = 0
        this.options = options
        this.init()
    }

    MakeSlides.prototype = {
        init: function() {
            this.$container.children('slide').eq(this.index).addClass('current')
        },
        size: function() {
            return this.$container.children('slide').length
        },
        go: function(index) {
            if (index < 0) {
                return
            }
            var size = this.size()
            if (index >= size) {
                return
            }
            this._enter(this.index, index)
            this.index = index
        },
        _enter: function(from, to) {
            var direction = from < to ? 'directioNormal' : 'directionReverse'
            var slides = this.$container.children('slide')
            var $from = slides.eq(from).addClass('willLeave').addClass(direction)
            var $target = slides.eq(to).addClass('willEnter').addClass(direction)
            setTimeout(function() {
                $from.addClass('leave')
                    .one('transitionend', function() {
                        $from.removeClass('willLeave leave').removeClass(direction).removeClass('current')
                    })
                $target.addClass('enter')
                    .one('transitionend', function() {
                        $target.removeClass('willEnter enter').removeClass(direction).addClass('current')
                        console.log($target)
                    })
            })
        },
        next: function() {
            this.go(this.index + 1)
        },
        prev: function() {
            this.go(this.index - 1)
        }
    }

})(jQuery)

!(function($) {
    var slides = new app.MakeSlides('body')
    $(document).on('keydown', function(e) {
        switch (e.keyCode) {
            case 39:
            case 40:
                slides.next()
                break;
            case 37:
            case 38:
                slides.prev()
                break;
        }
    })
})(jQuery)
