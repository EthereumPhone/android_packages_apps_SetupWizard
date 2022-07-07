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

import android.annotation.Nullable;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.net.wifi.WifiManager;
import android.provider.Settings.Secure;
import android.content.Context;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.MalformedURLException;
import java.io.IOException;
import java.security.MessageDigest;
import org.lineageos.setupwizard.util.PhoneMonitor;
import org.lineageos.setupwizard.util.SetupWizardUtils;

public class SetupWizardExitActivity extends BaseSetupWizardActivity {

    private static final String TAG = SetupWizardExitActivity.class.getSimpleName();

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

        new Thread(run).start();

        launchHome();
        finish();
        applyForwardTransition(TRANSITION_ID_FADE);
        Intent i = new Intent();
        i.setClassName(getPackageName(), SetupWizardExitService.class.getName());
        startService(i);
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

}
