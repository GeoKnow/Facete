package org.aksw.facete.web.utils;

import java.util.Properties;

import javax.servlet.ServletContext;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.context.ServletContextAware;
import org.springframework.web.context.support.ServletContextResourcePatternResolver;

@Component
public class FaceteConfiguration
	implements ServletContextAware
{
	private ServletContext servletContext;
	//private String themePath;
	
	public FaceteConfiguration() {
		super();
	}
	
	@Override
	public void setServletContext(ServletContext servletContext) {
		this.servletContext = servletContext;
	}
	
	public FaceteTheme createTheme() {
		ServletContextResourcePatternResolver resolver = new ServletContextResourcePatternResolver(servletContext);
		//private static final PathMatchingResourcePatternResolver resolver = new ServletContextResourcePatternResolver();
		//private static ResourceLoader resolver = ;
		//new ServletContextResourcePatternResolver(); /
		
		Properties ini = new Properties();
		//String basePath = "../facete-client/src/main/webapp/resources/";
		String basePath = "/resources/";
		Resource iniFile = resolver.getResource(basePath + "facete-index.properties");
		//System.out.println(iniFile.getURL());
		//ini.load(iniFile.getInputStream());

		
		String title = ini.getProperty("title");
		String themePath = ini.getProperty("themePath");
		
		Resource headerFile = resolver.getResource(basePath + themePath + "");
	}
}
