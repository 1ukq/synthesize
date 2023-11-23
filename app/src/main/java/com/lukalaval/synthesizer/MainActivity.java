package com.lukalaval.synthesizer;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class MainActivity extends AppCompatActivity {

    EditText heading_et, latitude_et, longitude_et;
    Switch auto_s;
    Button setPose_b;

    User user;
    Map map;

    @SuppressLint("MissingPermission")
    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        heading_et = findViewById(R.id.et1);
        latitude_et = findViewById(R.id.et2);
        longitude_et = findViewById(R.id.et3);
        auto_s = findViewById(R.id.s1);
        setPose_b = findViewById(R.id.b1);

        user = new User(this);
        map = new Map(user);
        map.start();

        auto_s.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(auto_s.isChecked()) {
                    heading_et.setEnabled(false);
                    latitude_et.setEnabled(false);
                    longitude_et.setEnabled(false);
                    setPose_b.setEnabled(false);

                    heading_et.setText("" + user.heading);
                    latitude_et.setText("" + user.latitude);
                    longitude_et.setText("" + user.longitude);

                    map.restart();
                }
                else {
                    heading_et.setEnabled(true);
                    latitude_et.setEnabled(true);
                    longitude_et.setEnabled(true);
                    setPose_b.setEnabled(true);

                    map.stop();
                }
            }
        });

        setPose_b.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                map.restart();
            }
        });

    }
}