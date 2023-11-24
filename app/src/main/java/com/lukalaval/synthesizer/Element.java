package com.lukalaval.synthesizer;

import static java.lang.Math.max;

import android.media.MediaPlayer;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import java.util.Objects;
import java.util.concurrent.TimeUnit;

public class Element extends Thread {

    User user;
    String type;
    double latitude, longitude;
    MediaPlayer mp;
    int delay = 0;
    double pan = 0.0;

    final int EARTH_RADIUS = 6371;

    public Element(User user, String type, double latitude, double longitude) {
        this.user = user;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;

        this.start();
    }

    public void run() {
        try {
            while(true) {
                if(this.delay < 20 && user.latitude != 0.0) {
                    this.update();
                    System.out.println("START " + this.delay);
                    TimeUnit.SECONDS.sleep(this.delay);
                    this.mp.setVolume(
                            (float) Math.max(((Math.sqrt(2)/2)*(Math.cos(this.pan)-Math.sin(this.pan))), 0.0),
                            (float) Math.max(((Math.sqrt(2)/2)*(Math.cos(this.pan)+Math.sin(this.pan))), 0.0)
                    );
                    this.mp.start();
                }
            }
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    public void update() {
        double head, lat, lon;

        if(this.mp == null) {
            if(Objects.equals(this.type, "tree")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_tree1);
            } else if(Objects.equals(this.type, "tree1")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_tree1);
            } else if(Objects.equals(this.type, "tree2")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_tree2);
            } else if(Objects.equals(this.type, "tree3")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_tree3);
            } else if(Objects.equals(this.type, "trash")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_trashcan_dn);
            } else if(Objects.equals(this.type, "lamp")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_streetlight);
            } else if(Objects.equals(this.type, "bench")) {
                this.mp = MediaPlayer.create(user.context, R.raw.point_bench_up);
            }
        }

        if(user.auto_s.isChecked()) {
            head = user.heading;
            lat = user.latitude;
            lon = user.longitude;
        }
        else {
            head = Double.parseDouble(user.heading_et.getText().toString());
            lat = Double.parseDouble(user.latitude_et.getText().toString());
            lon = Double.parseDouble(user.longitude_et.getText().toString());
        }

        double distance = calculateDistance(lat, lon, this.latitude, this.longitude);
        double angle = calculateAngle(head, lat, lon, this.latitude, this.longitude);

        this.delay = (int) Math.round(distance);
        this.pan = - (angle * Math.PI) / 180;
        System.out.println(pan);
    }

    private Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        // https://www.baeldung.com/java-find-distance-between-points

        if(lat1 != null) {
            Double lat1Rad = Math.toRadians(lat1);
            Double lat2Rad = Math.toRadians(lat2);
            Double lon1Rad = Math.toRadians(lon1);
            Double lon2Rad = Math.toRadians(lon2);

            Double x = (lon2Rad - lon1Rad) * Math.cos((lat1Rad + lat2Rad) / 2);
            Double y = (lat2Rad - lat1Rad);
            Double distance = (Math.sqrt(x * x + y * y) * EARTH_RADIUS) * 1000;

            return distance;
        }

        return 0.0;
    }

    private Double calculateAngle(Double heading, Double lat1, Double lon1, Double lat2, Double lon2) {

        double longDiff = lon2-lon1;
        double y = Math.sin(longDiff)*Math.cos(lat2);
        double x = Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(longDiff);

        double res = heading - ( Math.toDegrees(Math.atan2(y, x)) + 360 ) % 360;

        if (res > 180) {
            res = 360-res;
        } else if(res < -180) {
            res = 360 + res;
        }

        return res;
    }
}
