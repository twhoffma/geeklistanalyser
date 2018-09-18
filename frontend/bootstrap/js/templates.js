(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['bgattr'] = template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "	<ul>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.attrs : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</ul>\r\n";
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "          		<li>\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),(data && data.first),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "				<span class=\"tp tpAttr\"><a href=\"https://glaze.hoffy.no?id="
    + alias2(alias1(((stack1 = ((stack1 = (depths[1] != null ? depths[1].geeklists : depths[1])) != null ? stack1["0"] : stack1)) != null ? stack1.objectid : stack1), depth0))
    + "&"
    + alias2(alias1((depths[1] != null ? depths[1].attrnm : depths[1]), depth0))
    + "="
    + alias2(alias1((depth0 != null ? depth0.objectid : depth0), depth0))
    + "\" target=\"blank_\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "</a></span>\r\n			</li>\r\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "        		  		<i class=\""
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].icon : depths[1]), depth0))
    + "\"></i>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
templates['bg'] = template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.primary : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "      		<span class=\"nm\"><a href=\"https://www.boardgamegeek.com/boardgame/"
    + alias2(alias1((depths[1] != null ? depths[1].bgid : depths[1]), depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "</a></span>\r\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    return "      	  <span class=\"nm\"><a href=\"https://www.boardgamegeek.com/boardgame/"
    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].bgid : depths[1]), depth0))
    + "\" target=\"_blank\">Unnamed boardgame</a>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "      	<span class=\"tp tpBoardgame\">Boardgame</span>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "      	<span class=\"tp tpExpansion\">Expansion</span>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    return "      	<span class=\"tp tpCollection\">Collection</span>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "      	<span class=\"tp tpReimplementation\">Reimpl.</span>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    return "      	<span class=\"tp tpIntegrates\">Integrates</span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=container.lambda;

  return "  <li class=\"bg\" data-obsies=\""
    + alias4(((helper = (helper = helpers.obsies || (depth0 != null ? depth0.obsies : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"obsies","hash":{},"data":data}) : helper)))
    + "\" data-tobsies=\""
    + alias4(((helper = (helper = helpers.tobsies || (depth0 != null ? depth0.tobsies : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tobsies","hash":{},"data":data}) : helper)))
    + "\" data-probsies=\""
    + alias4(((helper = (helper = helpers.probsies || (depth0 != null ? depth0.probsies : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"probsies","hash":{},"data":data}) : helper)))
    + "\">\r\n    <div class=\"block header\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.name : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.program(4, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "    </div>\r\n    <div class=\"block time\">\r\n      <span class=\"crets\">"
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.crets : stack1), depth0))
    + "</span>\r\n    </div>\r\n    <div class=\"block\">\r\n    <p>\r\n"
    + ((stack1 = helpers.unless.call(alias1,((stack1 = (depth0 != null ? depth0.expands : depth0)) != null ? stack1.length : stack1),{"name":"unless","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.expands : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.boardgamecompilation : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.boardgameimplementation : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.boardgameintegration : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </p>\r\n    </div>\r\n\r\n\r\n    <div class=\"block\">\r\n      <ul>\r\n        <li><i class=\"fas fa-calendar\"></i> "
    + alias4(((helper = (helper = helpers.yearpublished || (depth0 != null ? depth0.yearpublished : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"yearpublished","hash":{},"data":data}) : helper)))
    + "</li>\r\n        <li><i class=\"fas fa-users\"></i> "
    + alias4(((helper = (helper = helpers.minplayers || (depth0 != null ? depth0.minplayers : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"minplayers","hash":{},"data":data}) : helper)))
    + " - "
    + alias4(((helper = (helper = helpers.maxplayers || (depth0 != null ? depth0.maxplayers : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"maxplayers","hash":{},"data":data}) : helper)))
    + "</li>\r\n        <li><i class=\"far fa-clock\"></i> "
    + alias4(((helper = (helper = helpers.minplaytime || (depth0 != null ? depth0.minplaytime : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"minplaytime","hash":{},"data":data}) : helper)))
    + " - "
    + alias4(((helper = (helper = helpers.maxplaytime || (depth0 != null ? depth0.maxplaytime : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"maxplaytime","hash":{},"data":data}) : helper)))
    + "</li>\r\n        <li><i class=\"far fa-thumbs-up\"></i> "
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.thumbs : stack1), depth0))
    + " </li>\r\n        <li><i class=\"fas fa-hashtag\"></i> "
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.cnt : stack1), depth0))
    + " </li>\r\n      </ul>\r\n    </div>\r\n    <div class=\"block topmarg-10 details-bg\">\r\n"
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-wrench","attrnm":"boardgamemechanic","attrs":(depth0 != null ? depth0.boardgamemechanic : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-pen-fancy","attrnm":"boardgamedesigner","attrs":(depth0 != null ? depth0.boardgamedesigner : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-paint-brush","attrnm":"boardgameartist","attrs":(depth0 != null ? depth0.boardgameartist : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-tag","attrnm":"boardgamecategory","attrs":(depth0 != null ? depth0.boardgamecategory : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-user-friends","attrnm":"boardgamefamily","attrs":(depth0 != null ? depth0.boardgamefamily : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    </div>\r\n    <div class=\"block\">\r\n      <ul class=\"toggleDetails\">\r\n        <li><i class=\"fa fa-angle-down obs-caret\"></i></li>\r\n      </ul>\r\n    </div>\r\n  </li> \r\n";
},"usePartial":true,"useData":true,"useDepths":true});
templates['bgobs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  	<li class=\"lists\">\r\n      <div class=\"tobsies\">\r\n      	<span><i class=\"fa fa-handshake-o\"></i></span>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.tobies : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n  	</li>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "        	<span class=\"tp obs\"><a href=\"https://www.boardgamegeek.com/geeklist/item/"
    + alias2(alias1(depth0, depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(depth0, depth0))
    + "</a></span>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  	<li class=\"lists\">\r\n      <div class=\"obsies\">\r\n      	<span><i class=\"fas fa-list\"></i></span>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.obsies : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n  	</li>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  	<li class=\"lists\">\r\n      <div class=\"obsies\">\r\n      	<span><i class=\"far fa-list-alt\"></i></span>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.probsies : depth0),{"name":"each","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n  	</li>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        	<span class=\"tp obs\"><a href=\"https://www.boardgamegeek.com/previews/"
    + alias4(((helper = (helper = helpers.previewid || (depth0 != null ? depth0.previewid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"previewid","hash":{},"data":data}) : helper)))
    + "/item/"
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "</a></span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.tobsies : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.obsies : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.probsies : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();