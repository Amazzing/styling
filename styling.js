var isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
			if (this.tagName == 'SELECT' && !isMobileOrTablet){
				if (!$(this).parent().hasClass('styled-select'))
					$(this).addClass('wrapped').wrap('<div class="styled-select"></div>');
				$(this).parent().find('dl').remove();
				var options = $(this).find('option, optgroup');
				if (!options.length)
					return;
				var optionsHTML = '',
					longestTxt = '',
					maxChars = 0;
				options.each(function(i){
					var val = $(this).val(),
						optClass = 'option '+$.trim($(this).attr('class') || '')+($(this).is(':disabled') ? ' disabled' : '')+(!i ? ' first' : ''),
						optContent = $($(this)).text();
					if (this.nodeName == 'OPTGROUP'){
						val = '';
						optContent = $($(this)).attr('label');
						optClass = 'optgroup '+$.trim($(this).attr('class') || '');
					}
					var data = $($(this)).data();
					var dataHTML = '';
					for (var i in data)
						dataHTML += ' data-'+i+'="'+data[i]+'"';
					optionsHTML += '<li data-val="'+val+'" class="'+optClass+'"'+dataHTML+'>'+optContent+'</li>';
					var txt = $(this).text();
					if (txt.length > maxChars) {
						maxChars = txt.length;
						longestTxt = $(this).text();
					}
				});
				var newHTML = '<dl class="closed"><dt class="option"><span class="longest-txt">'+longestTxt+'</span><span class="selected_name">'+$(this).find('option:selected').text()+'</span><i class="toggle"></i></dt><dd><ul class="styled-options">';
				newHTML += optionsHTML;
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
				var type = $(this).attr('type'),
					cls = $(this).attr('class') || '';
				if ( type == 'checkbox' || type == 'radio' || type == 'file'){
					if (!$(this).parent().hasClass('styled-'+type)){
						$(this).wrap('<span class="styled-'+type+' '+cls+'"></span>');
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
			if (isMobileOrTablet)
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
			try {
				var viewPortPosition = this.getBoundingClientRect();
				var toTop = viewPortPosition.top;
				var toBottom = $(window).height() - viewPortPosition.bottom;
				if (toTop > toBottom && toBottom < $ul.outerHeight())
					$ul.addClass('above');
				else
					$ul.removeClass('above');
			}catch(err){};

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
	}).on('mousewheel.styling DOMMouseScroll.styling', '.styled-options', function(e){
		/*
		* copied from jquery.chosen
		*/
		var delta, _ref1, _ref2;
		delta = -((_ref1 = e.originalEvent) != null ? _ref1.wheelDelta : void 0) || ((_ref2 = e.originialEvent) != null ? _ref2.detail : void 0);
		if (delta != null) {
			e.preventDefault();
			if (e.type === 'DOMMouseScroll') {
				delta = delta * 40;
			}
			$(this).scrollTop(delta + $(this).scrollTop());
		}
	});

	// checkbox/radio events
	// in some cases click or change can be unbound, so bind both of them here
	$(document).on('change click', '.styled-checkbox input, .styled-radio input', function(e){
		// avoid double actions. click is automatically triggered before change
		if (e.type == 'click') {
			$(this).data('justclicked', true);
		} else if (e.type == 'change' && $(this).data('justclicked')) {
			$(this).data('justclicked', '');
			return;
		}
		if ($(this).attr('type') == 'radio')
			$('[type="radio"][name="'+$(this).attr('name')+'"]').each(function(){
				$(this).parent().toggleClass('checked', $(this).prop('checked'));
			});
		$(this).parent().toggleClass('checked', $(this).prop('checked'));
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
	$.uniform = {defaults:{},update:function(){}};
}(jQuery));

$(window).load(function(){
	$('select, input').addStyling();
});
