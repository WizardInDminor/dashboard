"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { WEATHER_LOCATION } from "@/lib/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherResponse {
  current: { temperature_2m: number; weather_code: number };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

function describe(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "Clear", Icon: Sun };
  if (code <= 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (code <= 48) return { label: "Foggy", Icon: CloudFog };
  if (code <= 67) return { label: "Rainy", Icon: CloudRain };
  if (code <= 77) return { label: "Snowy", Icon: CloudSnow };
  if (code <= 82) return { label: "Showers", Icon: CloudRain };
  if (code <= 86) return { label: "Snow showers", Icon: CloudSnow };
  return { label: "Thunderstorm", Icon: Zap };
}

export function WeatherWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather", WEATHER_LOCATION.latitude, WEATHER_LOCATION.longitude],
    queryFn: async () => {
      const { data } = await axios.get<WeatherResponse>(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: WEATHER_LOCATION.latitude,
            longitude: WEATHER_LOCATION.longitude,
            current: "temperature_2m,weather_code",
            daily:
              "weather_code,temperature_2m_max,temperature_2m_min",
            timezone: "auto",
            forecast_days: 7,
          },
        }
      );
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const current = data ? describe(data.current.weather_code) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Weather · {WEATHER_LOCATION.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">
            Couldn&apos;t load weather.
          </p>
        )}
        {data && current && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <current.Icon className="h-10 w-10 text-primary" />
              <div>
                <div className="text-3xl font-semibold">
                  {Math.round(data.current.temperature_2m)}°
                </div>
                <div className="text-sm text-muted-foreground">
                  {current.label}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {data.daily.time.map((day, i) => {
                const { Icon } = describe(data.daily.weather_code[i]);
                return (
                  <div key={day} className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {new Date(day).toLocaleDateString(undefined, {
                        weekday: "short",
                      })}
                    </div>
                    <Icon className="mx-auto h-4 w-4" />
                    <div className="text-xs">
                      {Math.round(data.daily.temperature_2m_max[i])}°
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(data.daily.temperature_2m_min[i])}°
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
