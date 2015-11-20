// var is_android = (navigator.userAgent.indexOf('Android ') > -1);
if (typeof isMobile == 'undefined')
	var isMobile = $(window).width() < 768;
(function($) {
	'use strict';
	$.stylingSettings = {
		chooseFileTxt : 'Choose file',
		noFiletxt : 'No file chosen',
	};
	// defined in product.js
	if (typeof product_fileButtonHtml != 'undefined')
		$.stylingSettings.chooseFileTxt = product_fileButtonHtml;
	if (typeof product_fileDefaultHtml != 'undefined')
		$.stylingSettings.noFiletxt = product_fileDefaultHtml;

	// defined in contact-form.js
	if (typeof contact_fileButtonHtml != 'undefined')
		$.stylingSettings.chooseFileTxt = contact_fileButtonHtml;
	if (typeof contact_fileDefaultHtml != 'undefined')
		$.stylingSettings.noFiletxt = contact_fileDefaultHtml;

	$.fn.addStyling = function(settings) {
		settings = $.extend({}, $.stylingSettings, settings);
		this.each(function(){
			if (this.tagName == 'SELECT'){
				if (!$(this).parent().hasClass('styled-select'))
					$(this).addClass('wrapped').wrap('<div class="styled-select"></div>');
				$(this).parent().find('dl').remove();
				var options = $(this).find('option, optgroup');
				if (!options.length)
					return;
				var newHTML = '<dl class="closed"><dt class="option '+$.trim($(this).attr('class') || '')+'"><span class="selected_name">'+$(this).find('option:selected').text()+'</span><i class="toggle"></i></dt><dd><ul>';
				options.each(function(i){
					var val = $($(this)).val();
					var optClass = 'option '+$.trim($(this).attr('class') || '');
					if (!i)
						optClass += ' first';
					var optContent = $($(this)).text();
					if (this.nodeName == 'OPTGROUP'){
						val = '';
						optContent = $($(this)).attr('label');
						optClass = 'optgroup '+$.trim($(this).attr('class') || '');
					}
					var data = $($(this)).data();
					var dataHTML = '';
					for (var i in data)
						dataHTML += ' data-'+i+'="'+data[i]+'"';
					newHTML += '<li data-val="'+val+'" class="'+optClass+'"'+dataHTML+'>'+optContent+'</li>';
				});
				newHTML += '</ul></dd></dl>';
				$(this).parent().append(newHTML);
				// fieldset fix
				if ($(this).closest('fieldset').length)
				{
					var resizeTimer;
					var $container = $(this).closest('.styledSelect');
					$container.css('max-width', $container.closest('fieldset').parent().innerWidth()+'px');
					$(window).resize(function(){
						clearTimeout(resizeTimer);
						resizeTimer = setTimeout(function() {
							$container.css('max-width', $container.closest('fieldset').parent().innerWidth()+'px');
						}, 200);
					});
				}
			}
			else if (this.tagName == 'INPUT'){
				var type = $(this).attr('type');
				if ( type == 'checkbox' || type == 'radio' || type == 'file'){
					if (!$(this).parent().hasClass('styled-'+type)){
						$(this).wrap('<span class="styled-'+type+'"></span>');
						if (type == 'file'){
							$(this).before('<span class="file-button">'+settings.chooseFileTxt+'</span><span class="file-name">'+settings.noFiletxt+'</span>');
						}
					}
					if (type != 'file' && $(this).prop('checked'))
						$(this).parent().addClass('checked');
				}
			}
			if ($(this).is(':disabled'))
				$(this).parent().addClass('disabled');			
			if (isMobile)
				$(this).parent().addClass('mobile');
		});
	}

	// select events
	$(document).on('click', function(e) {
		if (!$(e.target).closest('.styled-select').length)
			$('.styled-select dl').addClass('closed');
	}).on('click', '.styled-select dt', function(){
		var closed = $(this).parent().hasClass('closed');
		$('.styled-select dl').addClass('closed');
		if (closed){
			$(this).parent().removeClass('closed');
			var $ul = $(this).closest('.styled-select').find('ul');
			if (!$ul.hasClass('prepared')){
				var maxHeight = 3;
				$ul.find('li:visible').each(function(i){
					if (i > 9)
						return false;
					maxHeight += $(this).outerHeight();
				});
				$ul.css('max-height', maxHeight+'px').addClass('prepared');
			}
			var viewPortPosition = this.getBoundingClientRect();
			var toTop = viewPortPosition.top;
			var toBottom = $(window).height() - viewPortPosition.bottom;
			if (toTop > toBottom && toBottom < $ul.outerHeight())
				$ul.addClass('above');
			else
				$ul.removeClass('above');
		}
	}).on('click', '.styled-select li.option', function(){		
		$(this).closest('dl').addClass('closed').find('.selected_name').html($(this).html());
		if (!$(this).hasClass('dont-bubble')) {
			$(this).closest('.styled-select').find('select').val($(this).attr('data-val')).change().click();					
		} else {
			$(this).removeClass('dont-bubble');
			
		}
	}).on('change', 'select.wrapped', function(){		
		var val = $(this).val();
		$(this).parent().find('li[data-val="'+val+'"]').addClass('dont-bubble').click();
	});

	// checkbox/radio events
	// in some cases click or change can be unbound, so bind both of them here
	$(document).on('change click', '.styled-checkbox input, .styled-radio input', function(){
		if ($(this).attr('type') == 'radio')
			$('[type="radio"][name="'+$(this).attr('name')+'"]').each(function(){
				$(this).parent().removeClass('checked');
			});
		if ($(this).prop('checked'))
			$(this).parent().addClass('checked');
		else
			$(this).parent().removeClass('checked');
	});

	// file events
	$(document).on('change', '.styled-file input', function(){
		var fileName = [];
		for (var i in this.files)
			if ($.isNumeric(i))
				fileName.push(this.files[i].name);
		fileName = fileName.join(', ');
		$(this).siblings('.file-name').html(fileName);
	});

	// in some places uniform is called without pre-check
	$.fn.uniform = function (settings) {
		this.addStyling(settings);
	}
	$.uniform = {defaults:{}};
}(jQuery));

$(window).load(function(){
	$('select, input').addStyling();
});
