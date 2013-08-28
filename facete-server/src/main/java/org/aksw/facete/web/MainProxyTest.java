package org.aksw.facete.web;

import java.io.InputStream;
import java.net.Authenticator;
import java.net.PasswordAuthentication;
import java.net.URL;

import org.aksw.commons.util.StreamUtils;
import org.apache.commons.codec.binary.Base64;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.RDFNode;

public class MainProxyTest {
	public static void main(String[] args) throws Exception {
	    String proxyHost = "aklakan.dyndns-server.com";
	    String proxyPort = "80";
	    System.out.println("Using proxy: " + proxyHost + ":" + proxyPort);

	    final String proxyUser = "raven";
	    final String proxyPassword = "secret";
	    		
	    byte[] authEncBytes = Base64.encodeBase64(proxyPassword.getBytes());
		String proxyPasswordEnc = new String(authEncBytes);
	    
		// http://stackoverflow.com/questions/7597925/scope-of-system-setproperty-in-tomcat
	    System.setProperty("http.proxySet", "true");
	    System.setProperty("http.proxyHost", proxyHost);
	    System.setProperty("http.proxyPort", proxyPort);
	    //System.setProperty("http.proxyUser", proxyUser);
	    //System.setProperty("http.proxyPassword", proxyPassword);
	    System.setProperty("http.nonProxyHosts", "localhost|127.0.0.1");

	    
	    Authenticator.setDefault(new Authenticator() {
	          @Override
	         public PasswordAuthentication getPasswordAuthentication() {
	               if(getRequestorType() == Authenticator.RequestorType.PROXY) 
	                   return new PasswordAuthentication(proxyUser, proxyPassword.toCharArray());
	               else
	                  return super.getPasswordAuthentication();
	         }});
	    
	    
	    
	   
	    
//	    URL url = new URL("http://dbpedia.org");
//	    InputStream in = url.openStream();
//	    System.out.println(StreamUtils.toString(in));
	    
	    
	    String q= "SELECT ?p ?o WHERE { <http://dbpedia.org/resource/Mendelian_inheritance> ?p    ?o . } Limit 10";
		Query query = QueryFactory.create(q);
		QueryExecution qexec = QueryExecutionFactory.sparqlService("http://dbpedia.org/sparql", query);
		ResultSet results = qexec.execSelect();
		while (results.hasNext()) {
		QuerySolution result = results.nextSolution();
		RDFNode s = result.get("s");
		RDFNode p = result.get("p");
		RDFNode o = result.get("o");
		System.out.println( " { " + s + " " + p + " " + o + " . }");
		}
	}
}
