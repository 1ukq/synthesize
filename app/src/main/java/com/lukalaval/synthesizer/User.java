package com.lukalaval.synthesizer;

import static android.content.Context.SENSOR_SERVICE;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

public class User {

    EditText heading_et, latitude_et, longitude_et;
    Switch auto_s;


    double heading, latitude, longitude;
    Context context;

    LocationManager locationManager;
    LocationListener locationListener;

    @RequiresApi(api = Build.VERSION_CODES.N)
    public User(Context context) {

        this.context = context;

        heading_et = ((AppCompatActivity) context).findViewById(R.id.et1);
        latitude_et = ((AppCompatActivity) context).findViewById(R.id.et2);
        longitude_et = ((AppCompatActivity) context).findViewById(R.id.et3);
        auto_s = ((AppCompatActivity) context).findViewById(R.id.s1);

        // COORDINATES
        locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);

        locationListener = new LocationListener() {

            public void onLocationChanged(@NonNull Location location) {

                if(auto_s.isChecked()){
                    latitude = location.getLatitude();
                    longitude = location.getLongitude();

                    latitude_et.setText("" + latitude);
                    longitude_et.setText("" + longitude);
                }

            }

            public void onStatusChanged(String provider, int status, Bundle extras) {
            }

            public void onProviderEnabled(String provider) {
            }

            public void onProviderDisabled(String provider) {
            }
        };

        @SuppressLint("MissingPermission") ActivityResultLauncher<String[]> locationPermissionRequest = ((AppCompatActivity) context).registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                    Boolean fineLocationGranted = result.getOrDefault(android.Manifest.permission.ACCESS_FINE_LOCATION, false);
                    Boolean coarseLocationGranted = result.getOrDefault(android.Manifest.permission.ACCESS_COARSE_LOCATION, false);

                    if (fineLocationGranted != null && fineLocationGranted) {
                        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 1, locationListener);
                    } else if (coarseLocationGranted != null && coarseLocationGranted) {
                        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, locationListener);
                    } else {
                        Toast.makeText(context, "Location cannot be obtained due to missing permission.", Toast.LENGTH_LONG).show();
                    }
                }
        );

        String[] PERMISSIONS = {
                android.Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
        };

        locationPermissionRequest.launch(PERMISSIONS);



        // HEADING
        SensorManager sensorManager = (SensorManager) context.getSystemService(SENSOR_SERVICE);
        Sensor magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        Sensor accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);

        float[] lastAccelerometer = new float[3];
        float[] lastMagnetometer = new float[3];
        final boolean[] lastAccelerometerSet = {false};
        final boolean[] lastMagnetometerSet = {false};
        float[] rotationMatrix = new float[9];
        float[] orientation = new float[3];

        SensorEventListener sensorListener = new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent event) {
                if(auto_s.isChecked()) {

                    if (event.sensor == magnetometer) {
                        System.arraycopy(event.values, 0, lastMagnetometer, 0, event.values.length);
                        lastMagnetometerSet[0] = true;
                    } else if (event.sensor == accelerometer) {
                        System.arraycopy(event.values, 0, lastAccelerometer, 0, event.values.length);
                        lastAccelerometerSet[0] = true;
                    }

                    if (lastMagnetometerSet[0] && lastAccelerometerSet[0]) {
                        SensorManager.getRotationMatrix(rotationMatrix, null, lastAccelerometer, lastMagnetometer);
                        SensorManager.getOrientation(rotationMatrix, orientation);

                        float azimuthInRadians = orientation[0];
                        double azimuthInDegrees = (Math.toDegrees(azimuthInRadians) + 360) % 360;

                        heading = azimuthInDegrees;

                        heading_et.setText("" + heading);

                    }

                }
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int accuracy) {

            }
        };

        sensorManager.registerListener(sensorListener, magnetometer, SensorManager.SENSOR_DELAY_FASTEST);
        sensorManager.registerListener(sensorListener, accelerometer, SensorManager.SENSOR_DELAY_FASTEST);
    }
}
