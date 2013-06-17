package org.aksw.facete.web.utils;

import java.util.Properties;

import javax.servlet.ServletContext;

import org.aksw.commons.util.StreamUtils;
import org.aksw.facete.domains.minify_maven_plugin.FaceteTheme;
import org.springframework.core.io.Resource;
import org.springframework.web.context.ServletContextAware;
import org.springframework.web.context.support.ServletContextResourcePatternResolver;

public class FaceteConfigurator
	implements ServletContextAware
{
	private ServletContext servletContext;
	//private String themePath;
	
	public FaceteConfigurator() {
		super();
	}
	
	@Override
	public void setServletContext(ServletContext servletContext) {
		this.servletContext = servletContext;
	}
	
	public FaceteThemeConfig createThemeConfig() throws Exception {
		ServletContextResourcePatternResolver resolver = new ServletContextResourcePatternResolver(servletContext);
		//private static final PathMatchingResourcePatternResolver resolver = new ServletContextResourcePatternResolver();
		//private static ResourceLoader resolver = ;
		//new ServletContextResourcePatternResolver(); /
		
		Properties ini = new Properties();
		//String basePath = "../facete-client/src/main/webapp/resources/";
		String basePath = "/resources/";
		Resource iniRes = resolver.getResource(basePath + "facete-index.properties");
		//System.out.println(iniFile.getURL());
		ini.load(iniRes.getInputStream());

		
//		for(int i = 0; i < 100; ++i) {
//			System.out.println("WOOOOOOOOOOOOOOO" + ini.values());
//		}
		
		String themePath = ini.getProperty("facete.themePath");
		
		Resource headerRes = resolver.getResource(basePath + themePath + "/header.html");
		
		String headerStr = StreamUtils.toString(headerRes.getInputStream());		
		Resource themeIniRes = resolver.getResource(basePath + themePath + "/theme.xml");

		/*
		Properties themeIni = new Properties();
		themeIni.load(themeIniRes.getInputStream());

		String title = themeIni.getProperty("title");
		String version = themeIni.getProperty("version");
*/
		
		FaceteTheme theme = MinifyHelperPomImpl.unmarshal(themeIniRes.getInputStream(), FaceteTheme.class);
		//FaceteThemeOld result = new FaceteTheme(title, headerStr, version);
		
		
		
		//Properties ini = new Properties();
		//FileInputStream in = new FileInputStream("facete-index.properties");

		Resource pomRes = resolver.getResource(basePath + "facete-pom.xml");
		//Document doc = XmlUtils.loadFromStream(pomRes.getInputStream());
		
		
		MinifyHelper minifyHelper = MinifyHelperPomImpl.create(pomRes.getInputStream(), false);

		FaceteThemeConfig result = new FaceteThemeConfig(minifyHelper, theme, headerStr);

		
		
		return result;
	}
}
