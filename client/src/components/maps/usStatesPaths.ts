/**
 * US State SVG Path Data
 * Generated from us-atlas TopoJSON (pre-projected Albers USA)
 * ViewBox: 0 0 975 610
 */
import { feature } from "topojson-client";
import { geoPath } from "d3-geo";
import statesAlbers from "us-atlas/states-albers-10m.json";
import type { Topology, GeometryCollection } from "topojson-specification";

export interface StateInfo {
  name: string;
  abbreviation: string;
  path: string;
  centroid: [number, number];
}

// FIPS code to state abbreviation mapping
const FIPS_TO_ABBREV: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
  "56": "WY",
};

// Generate paths from TopoJSON using d3-geo
const topology = statesAlbers as unknown as Topology;
const geojson = feature(topology, topology.objects.states as GeometryCollection);

// Use a null projection since data is already pre-projected
const pathGenerator = geoPath().projection(null);

export const US_STATES: StateInfo[] = geojson.features
  .map((feat) => {
    const fips = String(feat.id).padStart(2, "0");
    const abbrev = FIPS_TO_ABBREV[fips];
    if (!abbrev) return null;

    const d = pathGenerator(feat) || "";
    const centroid = pathGenerator.centroid(feat) as [number, number];

    return {
      name: feat.properties?.name || "",
      abbreviation: abbrev,
      path: d,
      centroid,
    };
  })
  .filter((s): s is StateInfo => s !== null && s.path !== "");

// State name to abbreviation mapping
export const STATE_ABBREV_MAP: Record<string, string> = US_STATES.reduce((acc, state) => {
  acc[state.name.toLowerCase()] = state.abbreviation;
  acc[state.abbreviation] = state.abbreviation;
  return acc;
}, {} as Record<string, string>);

// Abbreviation to full name mapping
export const ABBREV_TO_NAME: Record<string, string> = US_STATES.reduce((acc, state) => {
  acc[state.abbreviation] = state.name;
  return acc;
}, {} as Record<string, string>);

// ViewBox dimensions for the SVG
export const MAP_VIEWBOX = "0 0 975 610";
export const MAP_WIDTH = 975;
export const MAP_HEIGHT = 610;
