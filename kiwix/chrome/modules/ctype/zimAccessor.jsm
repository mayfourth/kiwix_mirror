var EXPORTED_SYMBOLS = [ "zimAccessor" ];

Components.utils.import("resource://gre/modules/ctypes.jsm");
Components.utils.import("resource://modules/env.jsm");

let zimAccessor = {

    register: function () {
        this.zimHandler = null;        

        this.accessor = ctypes.open(env.chromeToPath("chrome://ctype/content/zimAccessor.so"));
	this._Create = this.accessor.declare("ZimAccessor_Create", ctypes.default_abi, ctypes.int32_t.ptr);
        this._Destroy = this.accessor.declare("ZimAccessor_Destroy", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._LoadFile = this.accessor.declare("ZimAccessor_LoadFile", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._Reset = this.accessor.declare("ZimAccessor_Reset", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._GetArticleCount = this.accessor.declare("ZimAccessor_GetArticleCount", ctypes.default_abi, ctypes.uint32_t, ctypes.int32_t.ptr);
        this._GetId = this.accessor.declare("ZimAccessor_GetId", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._GetPageUrlFromTitle = this.accessor.declare("ZimAccessor_GetPageUrlFromTitle", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetMainPageUrl = this.accessor.declare("ZimAccessor_GetMainPageUrl", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._GetMetatag = this.accessor.declare("ZimAccessor_GetMetatag", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);


        this._GetContent = this.accessor.declare("ZimAccessor_GetContent", ctypes.default_abi, ctypes.bool, ctypes.int32_t.ptr, ctypes.char.ptr, ctypes.char.ptr.ptr, ctypes.uint32_t.ptr, ctypes.char.ptr.ptr);

        this._SearchSuggestions = this.accessor.declare("ZimAccessor_SearchSuggestions", ctypes.default_abi, ctypes.uint32_t.ptr, ctypes.int32_t.ptr, ctypes.char.ptr);
        this._GetNextSuggestion = this.accessor.declare("ZimAccessor_GetNextSuggestion", ctypes.default_abi, ctypes.char.ptr, ctypes.int32_t.ptr);
        this._CanCheckIntegrity = this.accessor.declare("ZimAccessor_CanCheckIntegrity", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
        this._IsCorrupted = this.accessor.declare("ZimAccessor_IsCorrupted", ctypes.default_abi, ctypes.int16_t, ctypes.int32_t.ptr);
    },

    isZimFileLoaded: function() {
      return this.zimHandler != null ? true : false;
    },

    loadFile: function(zimFile) {
        this.zimHandler = this._Create();
        if (this.zimHandler == null) {
            dump("Unable to create libzimAccessor instance.\n");
            return false;
        }
        this.zimFile = zimFile;

        // loaded?
        return this._LoadFile(this.zimHandler, this.zimFile);
    },

    reset: function() {
        return this._Reset(this.zimHandler);
    },

    getArticleCount: function() {
        return this._GetArticleCount(this.zimHandler);
    },

    getId: function() {
        return this._GetId(this.zimHandler).readString();
    },

    getPageUrlFromTitle: function(title) {
        return this._GetPageUrlFromTitle(this.zimHandler, title).readString();
    },

    getMainPageUrl: function() {
        return this._GetMainPageUrl(this.zimHandler).readString();
    },

    getMetatag: function(name) {
        return this._GetMetatag(this.zimHandler, name).readString();
    },

    getContent: function(url, content, contentLength, contentType) {
    	var cContent = new ctypes.char.ptr;
    	var cContentLength = new ctypes.uint32_t;
    	var cContentType = new ctypes.char.ptr;

	dump("Loading " + url + "---------------------------------------------------\n");
	var cResult = this._GetContent(this.zimHandler, url, cContent.address(), cContentLength.address(), cContentType.address());

	contentLength.value = cContentLength.value;
	contentType.value = cContentType.readString();
	dump("JS type = " + contentType.value + "\n");
	dump("JS length = " + contentLength.value + "\n");

	content.value = "";
	if (contentLength.value > 0) {
  	  var cContentArray = ctypes.cast(cContent, ctypes.char.array(cContentLength.value).ptr);

	  function chr2(codePt) {
	    if (codePt > 0xFFFF) {
	      return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
	    }
	    return String.fromCharCode(codePt);
	  }

	  function verify(str, arr) {
	    var checksum=0;

	    for (i=0; i<arr.length; i++) {
	      checksum += arr[i];
	      checksum %= 1000;
	      if (str[i].charCodeAt(0) != arr[i]) {
	      	 dump("error in string at position " + i + " : " + str[i].charCodeAt(0) + " != " + arr[i] + "\n");
	      }
            }
	    dump("JS checksum = " + checksum+ "\n");
	  }

	  if (cContentArray.contents.length == 204) {
	     for (i=0; i<cContentArray.contents.length; i++) {
	     dump(cContentArray.contents[i] + ",");
	     }
	     dump("\n");
	  }

	  //content.value = String.fromCharCode.apply(String, cContentArray.contents);
	  for (i=0; i<contentLength.value; i++) {
	      content.value += chr2(cContentArray.contents[i]);
	  }
	  verify(content.value, cContentArray.contents);

	}

	return cResult;
    },

    searchSuggestions: function(prefix) {
        return this._SearchSuggestions(this.zimHandler, prefix).contents;
    },

    getNextSuggestion: function() {
        return this._GetNextSuggestion(this.zimHandler).readString();
    },

    canCheckIntegrity: function() {
        return this._CanCheckIntegrity(this.zimHandler) == 1;
    },

    isCorrupted: function() {
        return this._IsCorrupted(this.zimHandler) == 1;
    },

    unregister: function() {
        this._Destroy(this.zimHandler);
        this.accessor.close();
    },

};

zimAccessor.register();
