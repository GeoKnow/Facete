package org.aksw.facete.web.controller;

import javax.annotation.Resource;

import org.aksw.facete.web.utils.FaceteThemeConfig;
import org.aksw.facete.web.utils.MinifyHelper;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/*
function getJsSourceFiles() {
    $pomXml = simplexml_load_file("{$pomDir}facete-pom.xml");

    $fileNames = $pomXml->xpath("//*[local-name()='jsSourceFiles']/*[local-name()='param']");

    $webappDir = getWebappDir($pomXml);
    $jsSourceDir = getJsSourceDir($pomXml);
    $prefix = $webappDir . "/" . $jsSourceDir . "/";
    $result = addPrefix($prefix, $fileNames);

    return $result;
}
*/



/*
class PomHelper {
	
	public static create(InputStream pomIn, String basePath) {
		
		Document doc = XmlUtils.loadFromStream(pomIn);
			
		List<String> jsSourceFiles = evalToTextList(jsSourceFilesEx, doc);


	}
}
*/

//@RequestMapping("/welcome")
@Controller
public class FaceteIndexController {

//	@Resource(name="facete-html-includes")
//	private MinifyHelper htmlIncludes;
	
	@Resource(name="facete.themeConfig")
	FaceteThemeConfig themeConfig;
	
	//@RequestMapping(method = RequestMethod.GET)
	@RequestMapping(value = "/welcome.do", method = RequestMethod.GET)
	public String showIndexPage(ModelMap model) {
		
		MinifyHelper htmlIncludes = themeConfig.getMinifyHelper();
		
		String cssIncludes = htmlIncludes.createCssIncludeStr();
		String jsIncludes = htmlIncludes.createJsIncludeStr();
		
		String title = themeConfig.getTheme().getTitle();
		String headerStr = themeConfig.getHeaderStr();
		
		model.addAttribute("title", title);
		model.addAttribute("cssIncludes", cssIncludes);
		model.addAttribute("jsIncludes", jsIncludes);
		model.addAttribute("headerHtml", headerStr);
		
		return "facete-index";
	}
}