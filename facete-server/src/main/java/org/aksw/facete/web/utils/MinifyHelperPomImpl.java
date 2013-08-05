package org.aksw.facete.web.utils;

import java.io.InputStream;
import java.util.List;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;

import org.aksw.commons.util.XPathUtils;
import org.aksw.commons.util.XmlUtils;
import org.aksw.facete.domains.minify_maven_plugin.Configuration;
import org.springframework.core.io.FileSystemResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.collect.Iterables;

public class MinifyHelperPomImpl
	implements MinifyHelper
{
	public static final Function<String, String> cssIncludePattern = FunctionSurround.create("<link rel=\"stylesheet\" type=\"text/css\" href=\"", "\" />");
	public static final Function<String, String> jsIncludePattern = FunctionSurround.create("<script type=\"text/javascript\" src=\"", "\"></script>");

	public static XPathExpression compile(String expressionStr) {
		XPathExpression result;
		try {
			result = XPathUtils.compile(expressionStr);
		} catch(Exception e) {
			throw new RuntimeException(e);
		}

		return result;
	}
	
	public static Node evalToNode(XPathExpression xpath, Node node) throws XPathExpressionException {
		Node result = (Node)xpath.evaluate(node, XPathConstants.NODE);
		return result;
	}



	private Configuration config;
	private boolean isDebugEnabled;
	
	// TODO Get this from the pom
	//private String webappDir = "src/main/webapp";
	private String webappDir = ""; //resources";
	
	public MinifyHelperPomImpl(Configuration config, boolean isDebugEnabled) {
		this.config = config;
		this.isDebugEnabled = isDebugEnabled;
	}
	
	public String createCssIncludeStr() {
		List<String> paths = config.getCssSourceFiles().getParam();

		//String prefix = webappDir + "/" + config.getCssSourceDir() + "/";
		String prefix = webappDir + config.getCssSourceDir();

		Iterable<String> fullPaths = Iterables.transform(paths, FunctionSurround.create(prefix, null));
		
		Iterable<String> htmlStrs = Iterables.transform(fullPaths, cssIncludePattern);
		String result = Joiner.on("\n").join(htmlStrs);
		return result;
	}
	
	public String createJsIncludeStr() {
		List<String> paths = config.getJsSourceFiles().getParam();

		//String prefix = webappDir + "/" + config.getJsSourceDir() + "/";
		String prefix = webappDir + config.getJsSourceDir();

		Iterable<String> fullPaths = Iterables.transform(paths, FunctionSurround.create(prefix, null));
		
		Iterable<String> htmlStrs = Iterables.transform(fullPaths, jsIncludePattern);
		String result = Joiner.on("\n").join(htmlStrs);
		return result;
	}
	
	
//	public static final XPathExpression configPath = compile("/project/build/plugins/plugin[/groupId='com.samaxes.maven' and /arctifactId='minify-maven-plugin']/executions/execution[0]");	
	public static final XPathExpression configPath = compile("/project/build/plugins/plugin[groupId='com.samaxes.maven' and artifactId='minify-maven-plugin']/executions/execution[1]/configuration");

	public static Configuration getConfiguration(Document doc) throws Exception {
		//Document doc = XmlUtils.loadFromStream(in);
		
		Node node = evalToNode(configPath, doc);
		//System.out.println(XmlUtils.toString(node));
		
		Configuration result = unmarshal(node, Configuration.class);
		
		return result;
	}
	
	public static <T> T unmarshal(Node node, Class<T> clazz) throws JAXBException {
		JAXBContext context = JAXBContext.newInstance(clazz.getPackage().getName());

		Unmarshaller unmarshaller = context.createUnmarshaller();
		@SuppressWarnings("unchecked")
		T result = (T) unmarshaller.unmarshal(node); //file);
		return result;
	}

	public static <T> T unmarshal(InputStream in, Class<T> clazz) throws Exception {
		Document doc = XmlUtils.loadFromStream(in);
		T result = unmarshal(doc, clazz);
		return result;
	}
	
	
	
	public static MinifyHelperPomImpl create(InputStream in, boolean isDebugEnabled) throws Exception {
		Document doc = XmlUtils.loadFromStream(in);
		Configuration config = getConfiguration(doc);
		
		MinifyHelperPomImpl result = new MinifyHelperPomImpl(config, isDebugEnabled);
		return result;
	}

	
	private static final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(new FileSystemResourceLoader());

	public static MinifyHelper create() throws Exception {
		
		String basePath = "../facete-client/src/main/webapp/resources/";


		//Properties ini = new Properties();
		//FileInputStream in = new FileInputStream("facete-index.properties");

		Resource pomRes = resolver.getResource(basePath + "facete-pom.xml");
		//Document doc = XmlUtils.loadFromStream(pomRes.getInputStream());
		
		MinifyHelper result = MinifyHelperPomImpl.create(pomRes.getInputStream(), false);
		
		return result;
	}

	
//	
//
//	//public static final XPathExpression configPath = compile("//*[local-name()='plugin' and /groupId/text()='com.samaxes.maven' and /]/*[local-name()='param']");
//	

//	public static final XPathExpression cssSourceFilesEx = compile("//*[local-name()='cssSourceFiles']/*[local-name()='param']");
//	public static final XPathExpression jsSourceFilesEx = compile("//*[local-name()='jsSourceFiles']/*[local-name()='param']");
//
//	
//	public static List<String> getRawCssSourceFiles(Node node) {
//		return evalToTextList(cssSourceFilesEx, node);				
//	}
//
//	public static List<String> getRawJsSourceFiles(Node node) {
//		return evalToTextList(jsSourceFilesEx, node);				
//	}
//
//	
//	public static List<String> evalToTextList(XPathExpression xpath, Node node) {
//		NodeList nodeList;
//		try {
//			nodeList = (NodeList)xpath.evaluate(node, XPathConstants.NODESET);
//		} catch (XPathExpressionException e) {
//			throw new RuntimeException(e);
//		}
//
//		List<String> result = new ArrayList<String>();
//		for(int i = 0; i < nodeList.getLength(); ++i) {
//			String tmp = nodeList.item(i).getTextContent();
//			result.add(tmp);
//		}
//
//		return result;
//	}
//
}