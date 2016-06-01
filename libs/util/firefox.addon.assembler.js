aPackage('nart.util.firefox.addon.assembler', () => {
	
	var ScriptAssembler = aRequire('nart.util.script.assembler'),
		putFile = aRequire('nart.util.fs').putFile,
		mkDir = aRequire('nart.util.fs').mkDir;
	
	var formInstallRdf = (id, name, creator) => `<?xml version="1.0" encoding="UTF-8"?>
<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:em="http://www.mozilla.org/2004/em-rdf#">
  <Description about="urn:mozilla:install-manifest">
  
    <em:id>` + id + `</em:id>
    <em:type>2</em:type>
    <em:version>1.0</em:version>
    <em:bootstrap>true</em:bootstrap>
    <em:name>` + name + `</em:name>
    <em:creator>` + creator + `</em:creator>
    <em:description>` + name + `</em:description>
	
    <!-- Firefox -->
    <em:targetApplication>
      <Description>
        <em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id>
        <em:minVersion>1.0</em:minVersion>
        <em:maxVersion>1000.0.*</em:maxVersion>
      </Description>
    </em:targetApplication>
	
  </Description>
</RDF>`;

	var formBootstrapJs = script => `
function startup(data, reason){ ` + script + ` }
function install() {}
function shutdown(data, reason) {}
function uninstall() {}`
	
	var wrapOnPageScript = script => `
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
			
var isDisabled = false;

// внешние объекты оборачиваются во враппер, который иногда мешает назначать проперти
var unwrap = o => XPCNativeWrapper.unwrap(o)

// подписка на событие вида "создан контекст страницы"
var onPageStart = (() => {
	var isSubscribedOnPageStart = false;
	
	return cb => {
		if(isSubscribedOnPageStart) return;
		isSubscribedOnPageStart = true;
		
		var myObserver = {
			observe: function(subject, topic, data){
				if (!isDisabled && topic == "content-document-global-created" && subject instanceof Ci.nsIDOMWindow){
					cb(unwrap(subject));
				}
			}
		};

		var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		
		observerService.addObserver(myObserver, "content-document-global-created", false);
	}
	
})()

onPageStart(window => window.eval(` + JSON.stringify(script) + `));`
	
	return (params, cb) => {
		var param = name => {
			if(!(name in params)) throw 'No ' + name + ' parameter provided to firefox addon assembler.';
			return params[name];
		}
		
		var id = params.id || 'some@add.on',
			name = params.name || 'Some add-on',
			creator = params.creator || 'Someone',
			
			onPage = params.onPage || false,
			
			outDir = param('outDir') + '/' + id;
		
		new ScriptAssembler().setMainPackage(param('mainPackage')).assemble(script => {
			
			var rdf = formInstallRdf(id, name, creator);
			if(onPage) script = wrapOnPageScript(script);
			script = formBootstrapJs(script);
			
			mkDir(outDir, () => {
				putFile(outDir + '/install.rdf', rdf, () => {
					putFile(outDir + '/bootstrap.js', script, () => {
						cb && cb();
					})
				})
			});
		})
	}
	
});