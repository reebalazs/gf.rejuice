/**

* @depends a.js
* @depends b.js

*/


(function ($) {
    
//
// A console.log replacement that works on all browsers
// If the browser does not have a console, it's silent
//
// usage: log('This happened.');
// or:    log('Variables:', var1, var2, var3);
//
    var log = function () {
        if ( window.console && console.log ) {
            // log for FireBug or WebKit console
            console.log(Array.prototype.slice.call(arguments));
        }
    };
    
    //log(form_errors);

    $.widget('gfszamla.validateField', {

        options: {
            message: '',
            here_url: null
        },

               
        _create: function () {
            var self = this;
            // transform nodes
            this.element.wrap('<div class="validateField-wrapper"></div>');
            this.wrapper = this.element.parent();
            this.wrapper.prev('label').prependTo(this.wrapper);
            this.message = $('<div class="validateField-message"></div>');
            this.wrapper.prepend(this.message);
            this.setMessage(this.options.message);
            this.wrapper.next('br').remove();

            this.form = this.wrapper.parents('form');
            this.form_name = this.form.attr('name');

            this.element.blur(function () {
                self.validate();
            });

    
        },

        _destroy: function () {

        },

        validate: function () {
            var self = this;
            var name = self.element.attr('name');
            $.ajax({
                url: self.options.here_url + 'formValidate' + self.form_name + '.json?' + self.form.serialize(), 
                success: function (data) {
                    var message = data.validationError[name] || '';
                    self.setMessage(message);
                    
                    if (! $.isEmptyObject(message)) {
                        form_errors[name] = data.validationError[name];
                    } else {
                        delete form_errors[name];
                    }
                    var portalMessage = '';
                    if (! $.isEmptyObject(form_errors)) {
                        portalMessage = data.portalMessage;
                    }
                    $('#portalMessage').text(portalMessage); 
                    
                },
                error: function (data) {
                    //log('ERROR form validation');
                }
            
            });
        },
        setMessage: function (txt) {
            //log('setMessage:', txt);
            this.message.text(txt);
            if (txt) {
                this.message.show();
                this.wrapper.addClass('validateField-wrapper-active ui-state-error ui-corner-all');
                this.wrapper.removeClass('validateField-wrapper-inactive');
            } else {
                this.message.hide();
                this.wrapper.addClass('validateField-wrapper-inactive');
                this.wrapper.removeClass('validateField-wrapper-active ui-state-error ui-corner-all');
            }
        }

    });


    $(document).ready(function () {
        
        var here_url = $('meta[name="here_url"]').attr('content');


        $('.validateField').each(function () {
            var self = $(this);
            self.validateField({
                message: form_errors && form_errors[self.attr('name')],
                here_url: here_url
            });
        }),
            
        $( "input.date_field" ).datepicker({
            dateFormat: 'yy.mm.dd',
            onClose: function(dateText, inst) {
                log(dateText, inst);
                $(this).validateField('validate', dateText);
            }
        });
        $('input[type="submit"]').button();
        $('.navlinks a').button();

        
        var lang = $('select[name="_LOCALE_"]').find('option:selected').attr('value');
        var en = $('#seller_group_en');
        var hu = $('#seller_group_hu');

        if (lang == 'en') {
            en.show();
            hu.hide();
        } else {
            hu.show();
            en.hide();
        } 

        $('select[name="seller"]').change(function() {
            var seller_lang = $(this).find('option:selected').attr('value');
            if (seller_lang == 'en') { 
                en.show();
                hu.hide();
            } else {
                hu.show();
                en.hide();
            } 
        });
        

    });


})(jQuery);

	


