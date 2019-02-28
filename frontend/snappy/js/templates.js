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
    var stack1;

  return "                <span class=\"smallbox tp tpBoardgame\"><a href=\"https://glaze.hoffy.no?id="
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.objectid : stack1), depth0))
    + "&releasetype=boardgame\" target=\"blank_\">Boardgame</a></span>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <span class=\"smallbox tp tpExpansion\"><a href=\"https://glaze.hoffy.no?id="
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.objectid : stack1), depth0))
    + "&releasetype=expansion\" target=\"blank_\">Expansion</a></span>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <span class=\"smallbox tp tpCollection\"><a href=\"https://glaze.hoffy.no?id="
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.objectid : stack1), depth0))
    + "&releasetype=collection\" target=\"blank_\">Collection</a></span>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <span class=\"smallbox tp tpReimplementation\"><a href=\"https://glaze.hoffy.no?id="
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.objectid : stack1), depth0))
    + "&releasetype=reimplementation\" target=\"blank_\">Reimpl.</a></span>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <span class=\"smallbox tp tpIntegrates\"><a href=\"https://glaze.hoffy.no?id="
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.objectid : stack1), depth0))
    + "&releasetype=integration\" target=\"blank_\">Integrates</a></span>\r\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                    "
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.wants : stack1), depth0))
    + " \r\n";
},"18":function(container,depth0,helpers,partials,data) {
    return "                    ?\r\n";
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
    + "    </div>\r\n    <div class=\"block\">\r\n    <div style=\"float: left; text-align: left;\">\r\n            <div class=\"block time\">\r\n              <span class=\"crets\">"
    + alias4(alias5(((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.crets : stack1), depth0))
    + "</span>\r\n            </div>\r\n            <div class=\"block\">\r\n            <p>\r\n"
    + ((stack1 = helpers.unless.call(alias1,((stack1 = (depth0 != null ? depth0.expands : depth0)) != null ? stack1.length : stack1),{"name":"unless","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.expands : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.boardgamecompilation : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.boardgameimplementation : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.boardgameintegration : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </p>\r\n            </div>\r\n\r\n\r\n            <div class=\"block\">\r\n              <ul>\r\n                <li><i class=\"fas fa-calendar\"></i> "
    + alias4(((helper = (helper = helpers.yearpublished || (depth0 != null ? depth0.yearpublished : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"yearpublished","hash":{},"data":data}) : helper)))
    + "</li>\r\n                <li><i class=\"fas fa-users\"></i> "
    + alias4(((helper = (helper = helpers.minplayers || (depth0 != null ? depth0.minplayers : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"minplayers","hash":{},"data":data}) : helper)))
    + " - "
    + alias4(((helper = (helper = helpers.maxplayers || (depth0 != null ? depth0.maxplayers : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"maxplayers","hash":{},"data":data}) : helper)))
    + "</li>\r\n                <li><i class=\"far fa-clock\"></i> "
    + alias4(((helper = (helper = helpers.minplaytime || (depth0 != null ? depth0.minplaytime : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"minplaytime","hash":{},"data":data}) : helper)))
    + " - "
    + alias4(((helper = (helper = helpers.maxplaytime || (depth0 != null ? depth0.maxplaytime : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"maxplaytime","hash":{},"data":data}) : helper)))
    + "</li>\r\n                <!--<li><i class=\"far fa-thumbs-up\"></i> "
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.thumbs : stack1), depth0))
    + " </li>\r\n                <li><i class=\"fas fa-hashtag\"></i> "
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.cnt : stack1), depth0))
    + " </li>\r\n                <li><i class=\"fas fa-heart\"></i> \r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.wants : stack1),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.program(18, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "                </li>-->\r\n              </ul>\r\n            </div>\r\n      </div>\r\n      <div style=\"float: right; padding-right: 2px; padding-top: 2px;\">\r\n              <ul style=\"text-align: right;\">\r\n                <li>"
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.thumbs : stack1), depth0))
    + " <i class=\"far fa-thumbs-up\"></i></li>\r\n                <li>"
    + alias4(alias5(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.cnt : stack1), depth0))
    + " <i class=\"fas fa-hashtag\"></i></li>\r\n                <li>\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.geeklists : depth0)) != null ? stack1["0"] : stack1)) != null ? stack1.latest : stack1)) != null ? stack1.wants : stack1),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.program(18, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "		  <i class=\"fas fa-heart\"></i> \r\n                </li>\r\n              </ul>\r\n      </div>\r\n    </div>\r\n    <div class=\"block topmarg-10 details-bg attrs\">\r\n"
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-wrench","attrnm":"boardgamemechanic","attrs":(depth0 != null ? depth0.boardgamemechanic : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-pen-fancy","attrnm":"boardgamedesigner","attrs":(depth0 != null ? depth0.boardgamedesigner : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-paint-brush","attrnm":"boardgameartist","attrs":(depth0 != null ? depth0.boardgameartist : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-print","attrnm":"boardgamepublisher","attrs":(depth0 != null ? depth0.boardgamepublisher : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-tag","attrnm":"boardgamecategory","attrs":(depth0 != null ? depth0.boardgamecategory : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.render_attr,depth0,{"name":"render_attr","hash":{"icon":"fas fa-user-friends","attrnm":"boardgamefamily","attrs":(depth0 != null ? depth0.boardgamefamily : depth0)},"data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    </div>\r\n    <div class=\"block\">\r\n      <ul class=\"toggleDetails\">\r\n        <li><i class=\"fa fa-angle-down obs-caret fa-2x\"></i></li>\r\n      </ul>\r\n    </div>\r\n  </li> \r\n";
},"usePartial":true,"useData":true,"useDepths":true});
templates['bgobs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  	<li class=\"lists\">\r\n      <div class=\"tobsies\">\r\n      	<span><i class=\"fa fa-handshake-o\"></i></span>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.tobsies : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n  	</li>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "        	<span class=\"smallbox obs\"><a href=\"https://www.boardgamegeek.com/geeklist/item/"
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

  return "        	<span class=\"smallbox obs\"><a href=\"https://www.boardgamegeek.com/geekpreview/"
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
templates['sidenav_dropdown'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"form-group glaze-tmpl-filter-dropdown\">\n	<label for=\""
    + alias4(((helper = (helper = helpers.attr || (depth0 != null ? depth0.attr : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"attr","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.attrnm || (depth0 != null ? depth0.attrnm : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"attrnm","hash":{},"data":data}) : helper)))
    + "</label>\n	<select id=\""
    + alias4(((helper = (helper = helpers.attr || (depth0 != null ? depth0.attr : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"attr","hash":{},"data":data}) : helper)))
    + "\" class=\"form-control\" data-live-search=\"true\" data-glaze-default=\""
    + alias4(((helper = (helper = helpers.default_value || (depth0 != null ? depth0.default_value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"default_value","hash":{},"data":data}) : helper)))
    + "\"></select>\n	<span class=\"sidenav-reset-button\"><i class=\"fa fa-refresh\">reset</i></span>\n</div>\n";
},"useData":true});
templates['sidenav_filters'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div id=\"modSortingAndFilters\" class=\"modal fade\" role=\"dialog\">\n	<div class=\"modal-dialog\">\n		\n		<div class=\"modal-content\">\n			<div class=\"modal-header\">\n				<div>\n					<button type=\"button\" class=\"close pull-right pull-up\" data-dismiss=\"modal\">&times;</button>\n				</div>\n				<button type=\"button\" class=\"btn btn-default btn-block btn-primary\" data-dismiss=\"modal\" id=\"apply\">Apply</button>\n			</div>\n			<div class=\"modal-body\">\n				<h3><i class=\"fas fa-list\" /></h3>\n				<div>\n					<form>\n						<li>\n							<select id=\"sortby\" class=\"form-control\">\n								<option value=\"crets\" selected>Addition time</option>\n								<option value=\"name\">Name</option>\n								<option value=\"cnt\">Count</option>\n								<option value=\"thumbs\">Thumbs</option>\n								<option value=\"yearpublished\">Year</option>\n							</select>\n						</li>	\n						<li>\n							<label class=\"radio-inline\">\n							<input type=\"radio\" name=\"sortby_asc\" value=\"1\">Ascending</input>\n							</label>\n							<label class=\"radio-inline\">\n							<input type=\"radio\" name=\"sortby_asc\" value=\"0\" checked=\"checked\">Descending</input>\n							</label>\n						</li>\n					</form>\n				</div>\n					\n				<h3>Filters</h3>\n				<div>\n					<form>\n						<div class=\"form-group\">\n								<label for=\"releasetype\">\n								<select id=\"releasetype\" class=\"form-control\">\n									<option value=\"\">All</option>\n									<option value=\"boardgame\">Boardgames</option>\n									<option value=\"expansion\">Expansions</option>\n									<option value=\"collection\">Collections</option>\n									<option value=\"reimplementation\">Reimplementations</option>\n									<option value=\"integration\">Integrates with..</option>\n								</select>\n						</div>\n"
    + ((stack1 = container.invokePartial(partials.sidenav_dropdown,depth0,{"name":"sidenav_dropdown","hash":{"default_value":"All","filterattrnm":"Designer","filterattr":"boardgamedesigner"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_dropdown,depth0,{"name":"sidenav_dropdown","hash":{"default_value":"All","filterattrnm":"Publisher","filterattr":"boardgamepublisher"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_dropdown,depth0,{"name":"sidenav_dropdown","hash":{"default_value":"All","filterattrnm":"Artist","filterattr":"boardgameartist"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_dropdown,depth0,{"name":"sidenav_dropdown","hash":{"default_value":"All","filterattrnm":"Mechanic","filterattr":"boardgamemechanic"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_dropdown,depth0,{"name":"sidenav_dropdown","hash":{"default_value":"All","filterattrnm":"Category","filterattr":"boardgamecategory"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_dropdown,depth0,{"name":"sidenav_dropdown","hash":{"default_value":"All","filterattrnm":"Family","filterattr":"boardgamefamily"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_rangeslider,depth0,{"name":"sidenav_rangeslider","hash":{"default_max":"100","default_min":"0","filterattrnm":"Playing Time","filterattr":"playingtime"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_rangeslider,depth0,{"name":"sidenav_rangeslider","hash":{"default_max":"100","default_min":"0","filterattrnm":"Numer of players","filterattr":"numplayers"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials.sidenav_rangeslider,depth0,{"name":"sidenav_rangeslider","hash":{"default_max":"4712","default_min":"-5000","filterattrnm":"Year Published","filterattr":"yearpublished"},"data":data,"indent":"\t\t\t\t\t\t","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "					</form>\n				</div>\n					\n				<h3>Info</h3>\n				<p>All data is taken for free from BoardGameGeek's XMLAPI. As with that data, this data is strictly for non-commerical use and should not be altered.</p>\n				<p>I made it to get my ducks in a row before Essen 2015 and to learn new technologies. I won't guarantee anything about what you see here. It may be counting right, it may be wrong. In the case where lists-of-lists are available, some lists have been excluded to avoid \"poisoning\" the data.</p>\n				<p>Please do not try to exploit or crash my server. It's probably not that hard - but we're all friends here right?</p>\n				<p>If you want to play around with the code you can find it on <a href=\"https://github.com/twhoffma/geeklistanalyser\" target=\"_blank\">GitHub</a>.</p>\n			</div>\n			\n			<div class=\"modal-footer\">\n				<button type=\"button\" class=\"btn btn-default btn-block btn-primary\" data-dismiss=\"modal\" id=\"apply\">Apply</button>\n			</div>\n		</div>\n	</div>\n</div>\n";
},"usePartial":true,"useData":true});
templates['sidenav_listitem'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "  <div><b>"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</b></div>\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.geeklists : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <div class=\"list geeklist-menu-item\" data-geeklistid=\""
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\">\r\n        "
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\r\n    </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.grp : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['sidenav_lists'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "      <div class=\"sideNavBtn\" data-glaze-orderby=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" data-glaze-orderby-asc=1>\r\n        	<i class=\""
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n      </div>\r\n"
    + ((stack1 = helpers.unless.call(alias1,(data && data.last),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "        |\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"sidebar left\" id=\"sideNavLeft\">\r\n  <div class=\"header\">\r\n    <div class=\"closeSideNavBtn\">x</div>\r\n    <h1>\r\n      <i class=\"fas fa-list\"></i>\r\n    </h1>\r\n    <div class=\"sidebarorder\">\r\n      Order by: \r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.orderby : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n \r\n  <div id=\"sidenavLists\">\r\n   \r\n  </div>\r\n</div>\r\n";
},"useData":true});
templates['sidenav_rangeslider'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"form-group glaze-tmpl-filter-rangeslider\">\n	<label for=\""
    + alias4(((helper = (helper = helpers.attr || (depth0 != null ? depth0.attr : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"attr","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.attrrm || (depth0 != null ? depth0.attrrm : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"attrrm","hash":{},"data":data}) : helper)))
    + "</label>\n	<div id=\""
    + alias4(((helper = (helper = helpers.attr || (depth0 != null ? depth0.attr : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"attr","hash":{},"data":data}) : helper)))
    + "\" class=\"filterslider\" data-glaze-default-min=\""
    + alias4(((helper = (helper = helpers.default_min || (depth0 != null ? depth0.default_min : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"default_min","hash":{},"data":data}) : helper)))
    + "\" data-glaze-default-max=\""
    + alias4(((helper = (helper = helpers.default_max || (depth0 != null ? depth0.default_max : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"default_max","hash":{},"data":data}) : helper)))
    + "\"></div>\n	\n	<input class=\"min\" for=\"number\" step=\"1\"></input>\n	<input class=\"max\" for=\"number\" step=\"1\"></input>\n	<span class=\"sidenav-reset-button\"><i class=\"fa fa-refresh\">reset</i></span>\n</div>\n";
},"useData":true});
})();