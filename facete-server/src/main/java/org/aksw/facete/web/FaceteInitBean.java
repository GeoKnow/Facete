package org.aksw.facete.web;

import java.net.Authenticator;
import java.net.PasswordAuthentication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Just a quick hack to fix a proxy issue with the Facete legacy code.
 * Newer code should use Java-based Spring configuration. 
 * 
 * 
 * @author raven
 *
 */
public class FaceteInitBean {
    
    private static final Logger logger = LoggerFactory.getLogger(FaceteInitBean.class);
    
    public FaceteInitBean() 
    {
        
    }

    public static void init() {
        //logger.info("FaceteInitBean invoked");

        final String proxyUser = System.getProperty("http.proxyUser");
        final String proxyPassword = System.getProperty("http.proxyPassword");
        
        //System.out.println("http.proxyUser:" + );
        //System.out.println("http.proxyPassword: " + System.getProperty("http.proxyPassword"));
        
        if(proxyUser != null && proxyPassword != null) {
        
            Authenticator.setDefault(new Authenticator() {
                @Override
                public PasswordAuthentication getPasswordAuthentication() {
                    if(getRequestorType() == Authenticator.RequestorType.PROXY) {
                        logger.debug("[FaceteInitBean] Configured authenticator for proxy requests");
                        return new PasswordAuthentication(proxyUser, proxyPassword.toCharArray());
                    }
                    else {
                        logger.debug("[FaceteInitBean] Configured defaulth authenticator for proxy requests");
                        return super.getPasswordAuthentication();
                    }
                }
            });

        } else {
            logger.info("[FaceteInitBean] invoked");
        }
    }
}
