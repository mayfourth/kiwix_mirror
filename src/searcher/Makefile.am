bin_PROGRAMS=kiwix-search
AM_CPPFLAGS=-I$(top_srcdir)/src/common
kiwix_search_SOURCES= \
	kiwix-search.cpp \
	../common/resourceTools.cpp \
	../common/stringTools.cpp \
	../common/kiwix/searcher.cpp \
	../common/kiwix/xapianSearcher.cpp \
	../common/kiwix/cluceneSearcher.cpp \
	../common/kiwix/searcher.h \
	../common/resourceTools.h \
	../common/stringTools.h \
	../common/kiwix/xapianSearcher.h \
	../common/kiwix/cluceneSearcher.h
kiwix_search_CXXFLAGS=$(XAPIAN_CFLAGS) $(CLUCENE_CFLAGS) $(ICU_CFLAGS) $(CTPP2_CFLAGS) $(ZLIB_CFLAGS) $(UUID_CFLAGS) -I../common/

kiwix_search_LDFLAGS=$(CHECK_LDFLAGS)

if STATIC_BINS
kiwix_search_LDFLAGS+= $(XAPIAN_STATIC_LDFLAGS) $(CLUCENE_STATIC_LDFLAGS) $(ICU_STATIC_LDFLAGS) $(CTPP2_STATIC_LDFLAGS) $(ZLIB_STATIC_LDFLAGS) ../ctpp2/src/.libs/libctpp2.a $(UUID_STATIC_LDFLAGS) $(STATIC_LIBM_ARCHIVE) $(STATIC_LIBSTDCPP_ARCHIVE) $(STATIC_LIBDL_ARCHIVE) $(STATIC_LIBGCC_ARCHIVE) $(STATIC_LIBPTHREAD_ARCHIVE) --static
else
kiwix_search_LDFLAGS+= $(XAPIAN_LDFLAGS) $(CLUCENE_LDFLAGS) $(ICU_LDFLAGS) $(CTPP2_LDFLAGS) $(ZLIB_LDFLAGS) ../ctpp2/src/.libs/libctpp2.a $(UUID_LDFLAGS) -ldl -lpthread
endif

if IS_OSX
kiwix_search_LDFLAGS+= /opt/local/lib/libiconv.a /opt/local/lib/libintl.a -framework IOKit -framework CoreFoundation
endif
