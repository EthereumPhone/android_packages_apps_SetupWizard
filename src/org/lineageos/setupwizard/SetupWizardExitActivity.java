/*
 * Copyright (C) 2017-2021 The LineageOS Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.lineageos.setupwizard;

import static android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK;
import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

import static org.lineageos.setupwizard.SetupWizardApp.LOGV;

import android.os.Build;
import android.annotation.Nullable;
import android.annotation.SuppressLint;
import android.app.WallpaperManager;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.net.wifi.WifiManager;
import android.provider.Settings.Secure;
import android.content.Context;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.ImageView;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.MalformedURLException;
import java.io.IOException;
import java.lang.reflect.*;
import java.security.MessageDigest;
import org.lineageos.setupwizard.util.PhoneMonitor;
import org.lineageos.setupwizard.util.SetupWizardUtils;

public class SetupWizardExitActivity extends BaseSetupWizardActivity {

    private static final String TAG = SetupWizardExitActivity.class.getSimpleName();
    private ImageView imageView;
    private Bitmap bitmap;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (LOGV) {
            Log.v(TAG, "onCreate savedInstanceState=" + savedInstanceState);
        }
        SetupWizardUtils.enableCaptivePortalDetection(this);
        PhoneMonitor.onSetupFinished();
        final Context context = this;
        Runnable run = new Runnable() {
            public void run() {
                int responseCode = 0;
                HttpURLConnection urlConnection = null;

                String android_id = Secure.getString(context.getContentResolver(), Secure.ANDROID_ID);
                WifiManager wifiManager = getSystemService(WifiManager.class);
                String macAddress = wifiManager.getConnectionInfo().getMacAddress();
                String ethOSID = sha256(android_id + ":" + macAddress);

                String urlString = "https://us-central1-imx-minting-ethos.cloudfunctions.net/submitHash?hash="
                        + ethOSID;

                System.out.println("SETUPWIZARD_HASH: (Trying to do request)");
                try {
                    URL url = new URL(urlString);
                    urlConnection = (HttpURLConnection) url.openConnection();
                    responseCode = urlConnection.getResponseCode();
                } catch (MalformedURLException malformed) {
                    System.out.println("SETUPWIZARD_HASH: (MalformedURLException) " + malformed.getMessage());
                } catch (IOException ioexc) {
                    System.out.println("SETUPWIZARD_HASH: (IOException) " + ioexc.getMessage());
                } finally {
                    if (urlConnection != null) {
                        System.out.println("SETUPWIZARD_HASH: (Disconnecting now) " + responseCode);
                        urlConnection.disconnect();
                    }
                }
                System.out.println("SETUPWIZARD_HASH: (Finish Request)");
            }
        };

        //--
	hookWebView();
	System.out.println("SetupWizard: Hooked Webview");
        WebView wv = new WebView(this);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.getSettings().setAllowFileAccess(true);
        wv.getSettings().setDomStorageEnabled(true); // Turn on DOM storage
        wv.getSettings().setAppCacheEnabled(true); //Enable H5 (APPCache) caching
        wv.getSettings().setDatabaseEnabled(true);
        wv.addJavascriptInterface(new DataReceiver(), "Android");
        wv.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                android.util.Log.d("WebView", consoleMessage.message());
                return true;
            }
        });
	System.out.println("SetupWizard: Finished setting webview");
        wv.loadUrl("file:///android_asset/index.html");
	System.out.println("SetupWizard: Finished loading");
        //setBackground();
        //--
        new Thread(run).start();
	
	launchHome();
	finish();
    }

    /**
     * Decodes base64 string to display on imageView
     */
    private class DataReceiver {
        @JavascriptInterface
        public void setImage(String data) {
            Log.d("WebView_img", data);
            byte[] decodedString = Base64.decode(data.split("data:image/png;base64,")[1], Base64.DEFAULT);
            Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            /**runOnUiThread(() -> {
                try {
			WallpaperManager wallpaperManager = WallpaperManager.getInstance(getApplicationContext());
			wallpaperManager.setBitmap(decodedByte);
        		// applyForwardTransition(TRANSITION_ID_FADE);
        		// Intent i = new Intent();
        		// i.setClassName(getPackageName(), SetupWizardExitService.class.getName());
        		// startService(i);
		} catch(IOException e) {
			e.printStackTrace();
		}
            });*/
	    System.out.println("SetupWizard: FInished creating wallpaper: "+data);
        }
    }

    private void launchHome() {
        startActivity(new Intent("android.intent.action.MAIN")
                .addCategory("android.intent.category.HOME")
                .addFlags(FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK));
        startActivity(getPackageManager().getLaunchIntentForPackage("io.metamask"));
    }

    public String sha256(final String base) {
        try {
            final MessageDigest digest = MessageDigest.getInstance("SHA-256");
            final byte[] hash = digest.digest(base.getBytes("UTF-8"));
            final StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < hash.length; i++) {
                final String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

public static void hookWebView() {
    int sdkInt = Build.VERSION.SDK_INT;
    try {
        Class<?> factoryClass = Class.forName("android.webkit.WebViewFactory");
        Field field = factoryClass.getDeclaredField("sProviderInstance");
        field.setAccessible(true);
        Object sProviderInstance = field.get(null);
        if (sProviderInstance != null) {
            System.out.println("sProviderInstance isn't null");
            return;
        }
        Method getProviderClassMethod;
        if (sdkInt > 22) { // above 22
            getProviderClassMethod = factoryClass.getDeclaredMethod("getProviderClass");
        } else if (sdkInt == 22) { // method name is a little different
            getProviderClassMethod = factoryClass.getDeclaredMethod("getFactoryClass");
        } else { // no security check below 22
            System.out.println("Don't need to Hook WebView");
            return;
        }
        getProviderClassMethod.setAccessible(true);
        Class<?> providerClass = (Class<?>) getProviderClassMethod.invoke(factoryClass);
        Class<?> delegateClass = Class.forName("android.webkit.WebViewDelegate");
        Constructor<?> providerConstructor = providerClass.getConstructor(delegateClass);
        if (providerConstructor != null) {
            providerConstructor.setAccessible(true);
            Constructor<?> declaredConstructor = delegateClass.getDeclaredConstructor();
            declaredConstructor.setAccessible(true);
            sProviderInstance = providerConstructor.newInstance(declaredConstructor.newInstance());
            System.out.println("sProviderInstance:{}");
            field.set("sProviderInstance", sProviderInstance);
        }
        System.out.println("Hook done!");
    } catch (Throwable e) {
        //Nothing for now
    }
}

@Override
public void startActivityForResult(Intent intent, int requestCode) {
    try {
        super.startActivityForResult(intent, requestCode);
    } catch (Exception ignored){}
}
}

