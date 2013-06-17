package org.aksw.facete.web.utils;

import javax.annotation.Nullable;

import com.google.common.base.Function;

public class FunctionSurround
	implements Function<String, String>
{
	private String prefix;
	private String suffix;
	
	public FunctionSurround(String prefix, String suffix) {
		this.prefix = prefix;
		this.suffix = suffix;
	}
	
	@Override
	public String apply(@Nullable String input) {
		String result = "";
		
		if(prefix != null) {
			result += prefix;
		}
		
		if(input != null) {
			result += input;
		}
		
		if(suffix != null) {
			result += suffix;
		}
		
		return result;
	}
	
	public static FunctionSurround create(String prefix, String suffix) {
		return new FunctionSurround(prefix, suffix);
	}
}