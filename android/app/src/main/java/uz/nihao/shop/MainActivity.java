package uz.nihao.shop;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();

        // Get the WebView from the bridge
        WebView webView = getBridge().getWebView();

        // ✅ Fix 1: Disable overscroll (pull-to-refresh effect)
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

        // Essential settings for React/Next.js
        WebSettings settings = webView.getSettings();
        settings.setDomStorageEnabled(true);
        settings.setJavaScriptEnabled(true);

        // Enable hardware acceleration for smooth scroll
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
    }
}
