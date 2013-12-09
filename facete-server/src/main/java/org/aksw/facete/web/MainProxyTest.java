package org.aksw.facete.web;

import java.net.Authenticator;
import java.net.PasswordAuthentication;

import javax.ws.rs.core.MediaType;

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
		
		System.out.println(MediaType.APPLICATION_JSON);
	    String proxyHost = "aklakan.dyndns-server.com";
	    String proxyPort = "80";
	    System.out.println("Using proxy: " + proxyHost + ":" + proxyPort);

	    final String proxyUser = "raven";
	    final String proxyPassword = "secret";
	    		
	    byte[] authEncBytes = Base64.encodeBase64(proxyPassword.getBytes());
		String proxyPasswordEnc = new String(authEncBytes);
	    
		// http://stackoverflow.com/questions/7597925/scope-of-system-setproperty-in-tomcat
	    //System.setProperty("http.proxySet", "true");
	    //System.setProperty("http.proxyUser", proxyUser);
	    //System.setProperty("http.proxyPassword", proxyPassword);
	    //System.setProperty("http.nonProxyHosts", "localhost|127.0.0.1");

        System.setProperty("http.proxyHost", proxyHost);
        System.setProperty("http.proxyPort", proxyPort);

        System.out.println("http.proxyUser:" + System.getProperty("http.proxyUser"));
        System.out.println("http.proxyPassword: " + System.getProperty("http.proxyPassword"));
        
	    Authenticator.setDefault(new Authenticator() {
	        @Override
	        public PasswordAuthentication getPasswordAuthentication() {
	            if(getRequestorType() == Authenticator.RequestorType.PROXY) {
	                System.out.println("YAAAAYY ~~~ GO RPROXY GO!!!!");
	                return new PasswordAuthentication(proxyUser, proxyPassword.toCharArray());
	            }
	            else {
	                return super.getPasswordAuthentication();
	            }
	        }
	    });
	    
	    
	    
	   
	    
//	    URL url = new URL("http://dbpedia.org");
//	    InputStream in = url.openStream();
//	    System.out.println(StreamUtils.toString(in));
	    
	    
	    String q= "SELECT ?s ?t WHERE {?s a ?t . } Limit 10";
		Query query = QueryFactory.create(q);
		String serviceUrl = "http://dbpedia.org/sparql";
		//String serviceUrl = "http://localhost:8800/sparql";
		
		QueryExecution qexec = QueryExecutionFactory.sparqlService(serviceUrl, query);
		ResultSet results = qexec.execSelect();
		while (results.hasNext()) {
		QuerySolution result = results.nextSolution();
		RDFNode s = result.get("s");
		RDFNode t = result.get("t");
		System.out.println(result + " { " + s + " " + t + " . }");
		}
	}
}
