package org.aksw.facete.web.utils;

public class FaceteTheme {
	private String title;
	private String header;
	
	public FaceteTheme(String title, String header) {
		super();
		this.title = title;
		this.header = header;
	}

	public String getTitle() {
		return title;
	}

	public String getHeader() {
		return header;
	}
}
