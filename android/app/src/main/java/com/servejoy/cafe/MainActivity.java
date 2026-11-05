package com.servejoy.cafe;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.addJavascriptInterface(new AndroidPrintInterface(this, webView), "AndroidNativePrinter");
        }
    }

    public static class AndroidPrintInterface {
        private final Context context;
        private final WebView webView;

        public AndroidPrintInterface(Context context, WebView webView) {
            this.context = context;
            this.webView = webView;
        }

        @JavascriptInterface
        public void printBill(String jobName) {
            if (context == null || webView == null) return;
            webView.post(() -> {
                try {
                    PrintManager printManager = (PrintManager) context.getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null) {
                        String name = (jobName != null && !jobName.isEmpty()) ? jobName : "ServeJoy_Bill";
                        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(name);
                        printManager.print(name, printAdapter, new PrintAttributes.Builder().build());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
    }
}
