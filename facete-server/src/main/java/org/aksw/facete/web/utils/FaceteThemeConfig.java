package org.aksw.facete.web.utils;

import org.aksw.facete.domains.minify_maven_plugin.FaceteTheme;

public class FaceteThemeConfig {
	private MinifyHelper minifyHelper; 
	private FaceteTheme theme;
	private String headerStr;
	
	public FaceteThemeConfig(MinifyHelper minifyHelper, FaceteTheme theme, String headerStr) {
		super();
		this.minifyHelper = minifyHelper;
		this.theme = theme;
		this.headerStr = headerStr;
	}

	public MinifyHelper getMinifyHelper() {
		return minifyHelper;
	}

	public FaceteTheme getTheme() {
		return theme;
	}

	public String getHeaderStr() {
		return headerStr;
	}

}
