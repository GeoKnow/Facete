package org.aksw.facete.web;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;

/*
class AppContextBuilder {
	
	private WebAppContext webAppContext;
	
	public WebAppContext buildWebAppContext(){
		webAppContext = new WebAppContext();
		webAppContext.setDescriptor(webAppContext + "/WEB-INF/web.xml");
		webAppContext.setResourceBase(".");
		webAppContext.setContextPath("/runJetty");
		return webAppContext;
	}
} 
*/ 

public class ServerTest {

	// TODO update answer with maven deps
	// http://stackoverflow.com/questions/805280/loading-up-a-web-xml-for-integration-tests-with-jetty
	public static void main(String[] args) throws Exception {
		Server server = new Server(5555);
//		WebAppContext root = new WebAppContext();
//
//		root.setWar("src/main/webapp");
//		root.setContextPath("/");
		//ServletHolder sh = new ServletHolder(ServletContainer.class);

		//server.set
		ServletContextHandler context = new ServletContextHandler(server, "/", ServletContextHandler.SESSIONS);
		//context.getServletContext().set
		
        //context.getServletContext().setAttribute("queryExecutionFactory", qef);         
        //context.addServlet(sh, "/*");           
        

		//server.addHandler(root);
		//server.add
		server.start();
	}
}
