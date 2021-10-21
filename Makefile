# SPDX-License-Identifier: AGPL-3.0-or-later

ANT_TARGET = $(ANT_ARG_BUILDINFO) -Dajax.dir=$(ZIMBRA_PREFIX)/include/zm-admin-ajax clean-pkg admin-war

all: build-ant

include build.mk

install:
	$(call mk_install_dir, jetty_base/webapps/zimbraAdmin)
	$(call mk_install_dir, jetty_base/etc)
	$(call mk_install_dir, conf/templates/admin)

	cd $(INSTALL_DIR)/jetty_base/webapps/zimbraAdmin && jar -xf $(CURDIR)/build/dist/jetty/webapps/zimbraAdmin.war
	cp -R WebRoot/templates/* $(INSTALL_DIR)/conf/templates/admin/
	cp WebRoot/WEB-INF/jetty-env.xml $(INSTALL_DIR)/jetty_base/etc/zimbraAdmin-jetty-env.xml.in

	cat build/web.xml \
		| sed -e '/REDIRECTBEGIN/ s/\$$/ %%comment VAR:zimbraMailMode,-->,redirect%%/' \
		      -e '/REDIRECTEND/ s/^/%%comment VAR:zimbraMailMode,<!--,redirect%% /' \
		> $(INSTALL_DIR)/jetty_base/etc/zimbraAdmin.web.xml.in

clean: clean-ant
