package org.aksw.facete.web;

import java.util.Arrays;
import java.util.Properties;

import org.aksw.commons.util.XmlUtils;
import org.aksw.facete.domains.minify_maven_plugin.Configuration;
import org.aksw.facete.web.utils.MinifyHelper;
import org.aksw.facete.web.utils.MinifyHelperPomImpl;
import org.springframework.core.io.FileSystemResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.w3c.dom.Document;

import com.hp.hpl.jena.sparql.util.StringUtils;



public class Playground {
	
	private static final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(new FileSystemResourceLoader());
	//private static final PathMatchingResourcePatternResolver resolver = new ServletContextResourcePatternResolver();
	//private static ResourceLoader resolver = ;
	//new ServletContextResourcePatternResolver(); /

	
	public static void main(String[] args)
		throws Exception
	{
		Properties ini = new Properties();
		String basePath = "../facete-client/src/main/webapp/resources/";
		Resource iniFile = resolver.getResource(basePath + "facete-index.properties");
		System.out.println(iniFile.getURL());
		ini.load(iniFile.getInputStream());

		System.out.println(ini.values());
		//System.out.println(Arrays.asList("test", "foobar"));

		boolean isDebugEnabled = Boolean.parseBoolean(ini.getProperty("debug"));
		String themePath = ini.getProperty("themePath");
		String templateFile = ini.getProperty("templatefile");

	}
}
