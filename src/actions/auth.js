"use server";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { generateToken } from '../utils/functions'
import { NextResponse } from 'next/server';
import { error } from "console";
import * as Sentry from '@sentry/nextjs';

const loginSchema = z.object({
  email: z.string().email("Not a valid email").max(255, "Email too long"),
  password: z.string().min(5, "Password too short"),
});

const cookieConfig = {
  httpOnly: true,
  secure: false,
  maxAge: 60 * 60,
  //maxAge: 60 * 60 * 24 * 7, 
  sameSite: 'Strict',
};
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
const base_Uri = process.env.NEXT_PUBLIC_API_URL;


const INPROGRESS_STATUS_ID = process.env.INPROGRESS_STATUS_ID;
const ONHOLD_STATUS_ID = process.env.ONHOLD_STATUS_ID;
const STOPPED_STATUS_ID = process.env.STOPPED_STATUS_ID;
const OPENED_STATUS_ID = process.env.OPENED_STATUS_ID;

export async function areaSegments(){
  return [
    { value: "BR", label: "Bromley" },
    { value: "BN", label: "Brighton" },
    { value: "CR", label: "Croydon" },
    { value: ["EC","WC","E","SE","SW","W","NW","N"], label: "Central London" },
    { value: "DA", label: "Dartford" },
    { value: "EN", label: "Enfield" },
    { value: ["DA","E","EC","EN","IG","ME","RM","SE","CM","SS"], label: "East London" },
    { value: "GU", label: "Guildford" },
    { value: "HA", label: "Harrow" },
    { value: "IG", label: "Ilford" },
    { value: "KT", label: "Kingston" },
    { value: ["E","EC","EN","HA","IG","N","NW","RM","WC","W"], label: "North" },
    { value: ["EC","EN","IG","N","NW","RM","RM","SS","WC"], label: "North East" },
    { value: ["EC","HA","N","WC","NW","RG","SL","SW","W","TU","UB"], label: "North West" },
    { value: "ME", label: "Rochester" },
    { value: "RG", label: "Reading" },
    { value: "RH", label: "Redhill" },
    { value: "RM", label: "Romford" },
    { value: "SL", label: "Slough" },
    { value: "SM", label: "Sutton" },
    { value: ["BR","BN","CR","DA","E","EC","GU","KT","ME","RH","SE","SM","SW","TN","WC"], label: "South" },
    { value: ["BR","BN","CR","DA","E","EC","GU","KT","ME","RH","SE","SM","SW","TN","WC"], label: "South East" },
    { value: ["BR","CR","EC","WC","GU","KT","NW","SW","W","RG","SE","SL","SM","TW","UB"], label: "South West" },
    { value: "TN", label: "Tonbridge" },
    { value: ["EC","HA","N","NW","RG","SL","SM","SW","W","WC","TW","UB"], label: "West" },
    //greater london
  { value: ["EC", "E", "NW", "SW"], label: "City of London" },
  { value: ["E", "NW", "SE", "SW", "W"], label: "City of Westminster" },
  { value: ["NW", "SW", "W"], label: "Kensington & Chelsea" },
  { value: ["HA", "NW", "SW", "TW", "W"], label: "Hammersmith & Fulham" },
  { value: ["EC", "E", "EN", "HA", "NW", "SW"], label: "Camden" },
  { value: ["EC", "E", "N", "NW"], label: "Islington" },
  { value: ["EC", "E", "N"], label: "Hackney" },
  { value: ["E", "SE"], label: "Tower Hamlets" },
  { value: ["E", "SE", "SW"], label: "Southwark" },
  { value: ["BR", "SE", "SW"], label: "Lambeth" },
  { value: ["KT", "NW", "SE", "SW", "W"], label: "Wandsworth" },
  { value: ["BR", "KT", "SE", "SW"], label: "Merton" },
  { value: ["KT", "SW", "TW"], label: "Richmond upon Thames" },
  { value: ["CR", "KT", "SW"], label: "Kingston upon Thames" },
  { value: ["BR", "CR", "KT", "SM", "SW"], label: "Sutton" },
  { value: ["BR", "EN", "KT", "N", "SE", "SM", "SW"], label: "Croydon" },
  { value: ["BR", "DA", "E", "SE"], label: "Bromley" },
  { value: ["BR", "E", "SE", "SW"], label: "Lewisham" },
  { value: ["BR", "DA", "E", "SE"], label: "Greenwich" },
  { value: ["BR", "DA", "E", "RM"], label: "Bexley" },
  { value: ["E", "IG", "RM"], label: "Havering" },
  { value: ["E", "IG", "RM"], label: "Barking & Dagenham" },
  { value: ["E", "IG", "RM"], label: "Newham" },
  { value: ["E", "IG", "RM"], label: "Redbridge" },
  { value: ["E", "EN", "IG", "N", "RM"], label: "Waltham Forest" },
  { value: ["EC", "E", "EN", "N", "NW"], label: "Haringey" },
  { value: ["EN", "HA", "N", "NW"], label: "Barnet" },
  { value: ["HA", "NW", "SW", "W"], label: "Brent" },
  { value: ["HA", "TW", "UB", "W"], label: "Ealing" },
  { value: ["HA", "NW", "SW", "TW", "UB", "W"], label: "Hounslow" },
  { value: ["HA", "NW", "TW", "UB", "W"], label: "Hillingdon" },
  { value: ["EN", "HA", "UB"], label: "Harrow" },
  { value: ["E", "EN", "N"], label: "Enfield" },

//Yorkshire and the Humber
  { value: ["BD", "HG", "LS", "WF", "YO"], label: "Leeds" },
  { value: ["BD", "HD", "LS"], label: "Bradford" },
  { value: ["HD", "LS", "S", "WF"], label: "Wakefield" },
  { value: ["BD", "HD", "S", "WF"], label: "Huddersfield" },
  { value: ["LS", "WF", "YO"], label: "Castleford" },
  { value: ["DN", "WF", "YO"], label: "Pontefract" },
  { value: ["BD", "HG", "LS", "YO"], label: "Harrogate" },
  { value: ["DL", "HG"], label: "Ripon" },
  { value: ["HG", "YO"], label: "York" },
  { value: ["DN", "WF", "YO"], label: "Selby" },
  { value: ["DN", "HU", "YO"], label: "Goole" },
  { value: ["DN", "S", "YO"], label: "Doncaster" },
  { value: ["DN", "S", "WF"], label: "Barnsley" },
  { value: ["DN", "S"], label: "Rotherham" },
  { value: ["DE", "S", "SK"], label: "Sheffield" },
  { value: ["HU", "YO"], label: "Beverley" },
  { value: ["DN", "HU"], label: "Hull (Kingston upon Hull)" },
  { value: ["HU", "YO"], label: "Driffield" },
  { value: ["YO"], label: "Bridlington" },
  { value: ["YO"], label: "Scarborough" },
  { value: ["TS", "YO"], label: "Whitby" },
  { value: ["BD", "LS"], label: "Skipton" },
  { value: ["BD", "HG", "LS"], label: "Ilkley" },
  { value: ["BD"], label: "Keighley" },
  { value: ["DN"], label: "Scunthorpe" },
  { value: ["DN"], label: "Grimsby" },
  { value: ["HU", "YO"], label: "Hornsea" },
  { value: ["DL", "HG", "YO"], label: "Thirsk" },
  { value: ["DL", "KT", "TS", "YO"], label: "Northallerton" },
  { value: ["BD", "DL", "KT"], label: "Richmond" },
  { value: ["YO"], label: "Norton-on-Derwent" },

//East of England
  { label: "Peterborough", value: ["CB", "PE"] },
  { label: "Fenland", value: ["CB", "PE"] },
  { label: "Huntingdonshire", value: ["AL", "CB", "LU", "MK", "PE", "SG"] },
  { label: "East Cambridgeshire", value: ["CB", "IP", "PE", "SG"] },
  { label: "South Cambridgeshire", value: ["CB", "CM", "LU", "PE", "SG"] },
  { label: "Cambridge", value: ["CB", "SG"] },
  { label: "Bedford", value: ["AL", "LU", "MK", "SG"] },
  { label: "Central Bedfordshire", value: ["AL", "LU", "MK", "PE", "SG"] },
  { label: "Luton", value: ["AL", "LU", "MK", "SG"] },
  { label: "North Hertfordshire", value: ["AL", "CB", "LU", "MK", "SG"] },
  { label: "East Hertfordshire", value: ["AL", "CB", "CM", "EN", "LU", "SG"] },
  { label: "Stevenage", value: ["AL", "LU", "SG"] },
  { label: "Welwyn Hatfield", value: ["AL", "SG"] },
  { label: "Broxbourne", value: ["AL", "CM", "EN", "SG"] },
  { label: "St Albans", value: ["AL", "EN", "WD"] },
  { label: "Hertsmere", value: ["AL", "EN", "WD"] },
  { label: "Dacorum", value: ["AL", "HP", "WD"] },
  { label: "Three Rivers", value: ["AL", "EN", "HA", "HP", "WD"] },
  { label: "Watford", value: ["AL", "HA", "WD"] },
  { label: "King’s Lynn and West Norfolk", value: ["CB", "IP", "NR", "PE"] },
  { label: "Breckland", value: ["IP", "NR", "PE"] },
  { label: "North Norfolk", value: ["NR"] },
  { label: "Broadland", value: ["IP", "NR"] },
  { label: "Norwich", value: ["IP", "NR"] },
  { label: "South Norfolk", value: ["IP", "NR"] },
  { label: "Great Yarmouth", value: ["NR"] },
  { label: "Waveney", value: ["IP", "NR"] },
  { label: "Suffolk Coastal", value: ["CO", "IP", "NR"] },
  { label: "Mid Suffolk", value: ["CB", "CO", "IP"] },
  { label: "Babergh", value: ["CM", "CO", "IP"] },
  { label: "St Edmundsbury", value: ["CB", "IP"] },
  { label: "Forest Heath", value: ["CB", "IP"] },
  { label: "Braintree", value: ["CB", "CM", "CO"] },
  { label: "Uttlesford", value: ["AL", "CB", "CM", "SG"] },
  { label: "Chelmsford", value: ["CM", "SS"] },
  { label: "Colchester", value: ["CM", "CO"] },
  { label: "Tendring", value: ["CO"] },
  { label: "Maldon", value: ["CM", "SS"] },
  { label: "Rochford", value: ["CM", "SS"] },
  { label: "Southend-on-Sea", value: ["SS"] },
  { label: "Castle Point", value: ["SS"] },
  { label: "Basildon", value: ["CM", "SS"] },
  { label: "Brentwood", value: ["CM", "E", "IG", "SS"] },
  { label: "Epping Forest", value: ["AL", "CB", "CM", "EN", "SG"] },

//East Midlands
  { value: ["S", "DE", "NG"], label: "Derby" },
  { value: ["S", "DE", "NG"], label: "Chesterfield" },
  { value: ["S", "DE"], label: "Matlock" },
  { value: ["SK", "DE"], label: "Buxton" },
  { value: ["SK", "M"], label: "Glossop" },
  { value: ["DE", "NG"], label: "Ilkeston" },
  { value: ["DE", "LE"], label: "Swadlincote" },
  { value: ["DE"], label: "Ripley" },
  { value: ["DE"], label: "Belper" },
  { value: ["NG", "DE", "LE"], label: "Nottingham" },
  { value: ["NG", "S", "DN"], label: "Mansfield" },
  { value: ["DN", "NG"], label: "Retford" },
  { value: ["NG", "LN"], label: "Newark-on-Trent" },
  { value: ["DN", "NG", "S"], label: "Worksop" },
  { value: ["NG"], label: "Arnold" },
  { value: ["NG"], label: "Beeston" },
  { value: ["NG"], label: "Carlton" },
  { value: ["NG"], label: "Stapleford" },
  { value: ["NG"], label: "West Bridgford" },
  { value: ["LE", "CV"], label: "Leicester" },
  { value: ["NG", "LE"], label: "Loughborough" },
  { value: ["CV", "LE"], label: "Hinckley" },
  { value: ["LE", "CV"], label: "Lutterworth" },
  { value: ["LE", "NG"], label: "Melton Mowbray" },
  { value: ["LE", "NN"], label: "Market Harborough" },
  { value: ["LE"], label: "Coalville" },
  { value: ["DE", "LE"], label: "Ashby-de-la-Zouch" },
  { value: ["LE"], label: "Wigston" },
  { value: ["LE"], label: "Oadby" },
  { value: ["NN", "MK"], label: "Northampton" },
  { value: ["NN"], label: "Wellingborough" },
  { value: ["NN", "LE"], label: "Kettering" },
  { value: ["NN", "LE"], label: "Corby" },
  { value: ["NN", "MK"], label: "Towcester" },
  { value: ["NN"], label: "Daventry" },
  { value: ["NN"], label: "Brackley" },
  { value: ["NN"], label: "Rushden" },
  { value: ["NN"], label: "Higham Ferrers" },
  { value: ["LE", "NN", "PE"], label: "Oakham" },
  { value: ["LN", "DN", "NG"], label: "Lincoln" },
  { value: ["LN", "DN"], label: "Gainsborough" },
  { value: ["LN", "LE", "NG"], label: "Grantham" },
  { value: ["LN", "NG", "PE"], label: "Sleaford" },
  { value: ["LN", "PE", "NG"], label: "Boston" },
  { value: ["PE", "LN"], label: "Skegness" },
  { value: ["PE", "DN", "AB", "LN"], label: "Louth" },
  { value: ["PE"], label: "Spalding" },
  { value: ["LE", "PE"], label: "Stamford" },
  { value: ["LN", "AB"], label: "Horncastle" },
  { value: ["PE"], label: "Bourne" },
  { value: ["PE", "LN"], label: "Mablethorpe" },
  { value: ["LN", "AB"], label: "Alford" },
  { value: ["PE"], label: "Holbeach" },
  { value: ["LN", "DN"], label: "Market Rasen" },

  //North East England
    { value: ["NE"], label: "Alnwick" },
  { value: ["NE", "TD"], label: "Berwick-upon-Tweed" },
  { value: ["NE"], label: "Hexham" },
  { value: ["NE"], label: "Ashington" },
  { value: ["NE"], label: "Morpeth" },
  { value: ["NE"], label: "Blyth" },
  { value: ["NE"], label: "Amble" },
  { value: ["NE"], label: "Newcastle Upon Tyne" },
  { value: ["NE", "DH", "SR"], label: "Sunderland" },
  { value: ["DH", "NE"], label: "Gateshead" },
  { value: ["NE", "EH"], label: "South Shields" },
  { value: ["NE"], label: "North Shields" },
  { value: ["NE"], label: "Whitley Bay" },
  { value: ["NE", "SR", "DH"], label: "Washington" },
  { value: ["DH", "DL"], label: "Durham" },
  { value: ["DL"], label: "Darlington" },
  { value: ["DH", "SR", "CH"], label: "Peterlee" },
  { value: ["DL"], label: "Bishop Auckland" },
  { value: ["DL"], label: "Newton Aycliffe" },
  { value: ["SR"], label: "Seaham" },
  { value: ["DH"], label: "Stanley" },
  { value: ["DL"], label: "Barnard Castle" },
  { value: ["CA"], label: "Carlisle" },
  { value: ["CA"], label: "Workington" },
  { value: ["LA"], label: "Windermere" },
  { value: ["LA"], label: "Barrow-in-Furness" },
  { value: ["LA", "PR"], label: "Lancaster" },
  { value: ["FY", "PR"], label: "Blackpool" },
  { value: ["PR", "L", "CH"], label: "Southport" },
  { value: ["BB", "PR", "L", "LA", "WN", "BL"], label: "Preston" },
  { value: ["BB", "PR", "BL", "M"], label: "Blackburn" },
  { value: ["BB"], label: "Burnley" },
  { value: ["BB"], label: "Clitheroe" },
  { value: ["WN", "BL", "M", "WA", "L", "CH", "PR"], label: "Wigan" },
  { value: ["BL", "M", "WN", "BB"], label: "Bolton" },
  { value: ["M", "OL", "BL", "WA", "SK", "WN"], label: "Manchester" },
  { value: ["CH", "M", "WA", "WN", "PR", "L"], label: "Liverpool" },
  { value: ["CW", "CH"], label: "Chester" },
  { value: ["M", "L", "CH", "WN", "SK", "CW"], label: "Warrington" },
  { value: ["SK", "M", "CW", "WA"], label: "Macclesfield" },
  { value: ["CH", "CW", "SK"], label: "Crewe" },
  { value: ["SK", "CW", "M", "WA", "CH"], label: "Northwich" },

//South East England
  { value: ["RG", "SL"], label: "Reading" },
  { value: ["RG"], label: "Newbury" },
  { value: ["SL", "RG"], label: "Windsor" },
  { value: ["SL", "RG"], label: "Maidenhead" },
  { value: ["HP", "OX", "MK"], label: "Aylesbury" },
  { value: ["SL", "HP"], label: "High Wycombe" },
  { value: ["MK"], label: "Milton Keynes" },
  { value: ["RH", "BN"], label: "Brighton" },
  { value: ["BN"], label: "Eastbourne" },
  { value: ["TN"], label: "Hastings" },
  { value: ["SP", "SO"], label: "Winchester" },
  { value: ["PO", "CT", "SO"], label: "Southampton" },
  { value: ["PO"], label: "Portsmouth" },
  { value: ["SO", "SP"], label: "Andover" },
  { value: ["ME", "TN", "BR", "DA"], label: "Maidstone" },
  { value: ["CT", "TN"], label: "Canterbury" },
  { value: ["ME", "CT", "TN"], label: "Ashford" },
  { value: ["CT"], label: "Dover" },
  { value: ["ME", "DA", "BR"], label: "Rochester" },
  { value: ["OX", "SN"], label: "Oxford" },
  { value: ["OX", "HP", "MK"], label: "Bicester" },
  { value: ["OX"], label: "Banbury" },
  { value: ["GU", "RH", "KT"], label: "Guildford" },
  { value: ["GU", "KT"], label: "Woking" },
  { value: ["RH", "CR"], label: "Redhill" },
  { value: ["PO", "GU", "BN", "RH"], label: "Chichester" },
  { value: ["BN", "PO"], label: "Worthing" },
  { value: ["RH"], label: "Crawley" },
  { value: ["RH"], label: "Horsham" },


//South West England
  { value: ["BS", "BA"], label: "Bristol" },
  { value: ["TR"], label: "Truro" },
  { value: ["TR"], label: "Penzance" },
  { value: ["PL", "TR"], label: "St. Austell" },
  { value: ["TR"], label: "Redruth" },
  { value: ["PL", "EX"], label: "Launceston" },
  { value: ["TR"], label: "Hugh Town" },
  { value: ["BH", "DT"], label: "Bournemouth" },
  { value: ["BH"], label: "Poole" },
  { value: ["DT"], label: "Weymouth" },
  { value: ["DT"], label: "Dorchester" },
  { value: ["EX"], label: "Exeter" },
  { value: ["PL"], label: "Plymouth" },
  { value: ["TQ"], label: "Torquay" },
  { value: ["EX"], label: "Barnstaple" },
  { value: ["EX"], label: "Tiverton" },
  { value: ["PL", "EX"], label: "Okehampton" },
  { value: ["TQ", "EX"], label: "Newton Abbot" },
  { value: ["GL", "HR"], label: "Gloucester" },
  { value: ["GL", "WR"], label: "Cheltenham" },
  { value: ["SN", "GL"], label: "Cirencester" },
  { value: ["GL"], label: "Stroud" },
  { value: ["BA", "TA", "EX"], label: "Taunton" },
  { value: ["BS", "BA"], label: "Bath" },
  { value: ["DT", "TA", "BA"], label: "Yeovil" },
  { value: ["TA", "BS", "BA"], label: "Bridgwater" },
  { value: ["BS", "TA"], label: "Weston-super-Mare" },
  { value: ["BA", "BS"], label: "Wells" },
  { value: ["SN", "GL"], label: "Swindon" },
  { value: ["SP", "BH", "DT", "BA"], label: "Salisbury" },
  { value: ["BA", "SN"], label: "Trowbridge" },
  { value: ["BA", "SN"], label: "Chippenham" },
  { value: ["BA", "SN"], label: "Devizes" },

  //West Midlands
    { value: ["CV", "B", "DY"], label: "Birmingham" },
  { value: ["B", "DY", "WV", "WS"], label: "Wolverhampton" },
  { value: ["B", "CV"], label: "Coventry" },
  { value: ["DY", "B", "WS"], label: "Walsall" },
  { value: ["B", "DY"], label: "Dudley" },
  { value: ["B", "DY"], label: "West Bromwich" },
  { value: ["ST", "CW"], label: "Stoke-on-Trent" },
  { value: ["ST", "WS", "TF"], label: "Stafford" },
  { value: ["DE", "ST", "B", "WS"], label: "Burton Upon Trent" },
  { value: ["WS", "ST", "B", "DE"], label: "Lichfield" },
  { value: ["ST", "B", "WS", "DY"], label: "Cannock" },
  { value: ["CV", "B"], label: "Warwick" },
  { value: ["LE", "B", "CV"], label: "Nuneaton" },
  { value: ["CV", "NN"], label: "Rugby" },
  { value: ["CV", "B", "WR"], label: "Stratford-upon-Avon" },
  { value: ["TF", "SY"], label: "Shrewsbury" },
  { value: ["TF", "SY", "WV", "ST"], label: "Telford" },
  { value: ["SY"], label: "Oswestry" },
  { value: ["SY", "HR"], label: "Hereford" },
  { value: ["HR", "SY"], label: "Leominster" },
  { value: ["HR", "NP"], label: "Ross-on-Wye" },
  { value: ["DY", "B", "WR"], label: "Worcester" },
  { value: ["DY", "WR", "B", "WV"], label: "Kidderminster" },
  { value: ["B", "WR"], label: "Redditch" },
  { value: ["AB", "DD", "PH", "IV"], label: "Aberdeen Area" },
  { value: ["BA", "BS", "SN"], label: "Bath Area" },
  { value: ["BT"], label: "Belfast Area" },
  { value: ["RG", "SL", "OX"], label: "Berkshire Area" },
  { value: ["B", "DY", "WS", "CV"], label: "Birmingham Area" },
  { value: ["DY", "WV", "WS", "B"], label: "Black Country Area" },
  { value: ["BD", "HX", "LS"], label: "Bradford Area" },
  { value: ["BN", "RH", "GU"], label: "Brighton Area" },
  { value: ["BS", "GL", "SN"], label: "Bristol Area" },
  { value: ["CB", "PE", "SG", "AL"], label: "Cambridgeshire Area" },
  { value: ["CF", "NP", "SA", "HR"], label: "Cardiff Area" },
  { value: ["EC", "WC", "W", "SW", "SE", "E", "N", "NW"], label: "Central London" },
  { value: ["PR", "BB", "BL", "LA"], label: "Central Lancashire Area" },
  { value: ["TR", "PL"], label: "Cornwall Area" },
  { value: ["CV", "LE", "NN", "B"], label: "Coventry & Warwickshire Area" },
  { value: ["CA", "LA", "DG"], label: "Cumbria Area" },
  { value: ["DE", "NG", "LE"], label: "Derby Area" },
  { value: ["DD", "PH", "AB"], label: "Dundee Area" },
  { value: ["DH", "DL", "TS"], label: "Durham Area" },
  { value: ["EX", "TA"], label: "East Devon Area" },
  { value: ["CT", "ME", "TN"], label: "East Kent Area" },
  { value: ["E", "IG", "RM", "DA", "N", "SE", "EC", "WC", "EN", "CM"], label: "East London" },
  { value: ["EH", "FK", "KY"], label: "Edinburgh Area" },
  { value: ["CM", "CO", "SS", "RM"], label: "Essex Area" },
  { value: ["G", "ML", "PA", "FK"], label: "Glasgow Area" },
  { value: ["GL", "BS", "OX"], label: "Gloucestershire Area" },
  { value: ["IV", "KW", "HS", "PH", "AB"], label: "Highlands Area" },
  { value: ["HU", "YO", "DN"], label: "Hull Area" },
  { value: ["FY", "PR", "LA"], label: "Lancashire Coast Area" },
  { value: ["LS", "WF", "BD"], label: "Leeds Area" },
  { value: ["LE", "NG", "NN"], label: "Leicester Area" },
  { value: ["LN", "PE", "NG"], label: "Lincolnshire Area" },
  { value: ["L", "CH", "WA", "WN", "PR", "LA", "FY"], label: "Liverpool Area" },
  { value: ["M", "SK", "WN", "OL", "BL", "L", "CH", "PR", "FY", "WA"], label: "Manchester Area" },
  { value: ["TS", "DL", "YO"], label: "Middlesborough and Surroundings" },
  { value: ["NE", "DH", "SR"], label: "Newcastle and Sunderland area" },
  { value: ["NP", "CF", "HR"], label: "Newport Area" },
  { value: ["N", "NW", "EN", "E", "WC", "EC", "WD", "UB", "HA"], label: "North London" },
  { value: ["LL", "CH"], label: "North Wales" },
  { value: ["BT"], label: "North West NI Area" },
  { value: ["NN", "MK", "LE", "CV"], label: "Northamptonshire Area" },
  { value: ["NR", "PE", "IP"], label: "Norfolk Area" },
  { value: ["NG", "LE", "DE"], label: "Nottingham Area" },
  { value: ["OX", "RG", "NN"], label: "Oxfordshire Area" },
  { value: ["PE", "CB", "NG"], label: "Peterborough Area" },
  { value: ["PO", "SO", "GU"], label: "Portsmouth Area" },
  { value: ["S", "DN", "WF", "HD"], label: "Sheffield Area" },
  { value: ["SY", "TF", "WV"], label: "Shropshire Area" },
  { value: ["PL", "TQ", "EX"], label: "South Devon Area" },
  { value: ["BT"], label: "South Down & Newry Area" },
  { value: ["SE", "SW", "CR", "SM", "KT", "BR", "EC", "WC", "DA"], label: "South London" },
  { value: ["SO", "PO", "SP"], label: "Southampton Area" },
  { value: ["FK", "PH", "G", "ML", "EH"], label: "Stirling & Central Area" },
  { value: ["ST", "WS", "TF", "DE", "SY"], label: "Staffordshire Area" },
  { value: ["IP", "CO", "CB"], label: "Suffolk Area" },
  { value: ["SR", "DH", "NE"], label: "Sunderland Area" },
  { value: ["SA", "CF", "SY"], label: "Swansea Area" },
  { value: ["TN", "BR", "DA", "ME"], label: "West Kent Area" },
  { value: ["W", "SW", "TW", "UB", "HA", "NW", "EC", "WC", "SL"], label: "West London" },
  { value: ["SN", "SP", "BA"], label: "Wiltshire Area" },
  { value: ["YO", "DL", "TS", "HG"], label: "York & North Yorkshire Area" },
    { value: ["AB", "DD", "PH", "IV"], label: "Aberdeen and Surroundings" },
  { value: ["BA", "BS", "SN"], label: "Bath and Surroundings" },
  { value: ["LU,", "MK", "SG"], label: "Bedfordshire and Surroundings" },
  { value: ["BT"], label: "Belfast and Surroundings" },
  { value: ["RG", "SL", "OX"], label: "Berkshire and Surroundings" },
  { value: ["B", "DY", "WS", "CV"], label: "Birmingham and Surroundings" },
  { value: ["DY", "WV", "WS", "B"], label: "Black Country and Surroundings" },
  { value: ["BD", "HX", "LS"], label: "Bradford and Surroundings" },
  { value: ["BN", "RH", "GU"], label: "Brighton and Surroundings" },
  { value: ["BS", "GL", "SN"], label: "Bristol and Surroundings" },
  { value: ["CB", "PE", "SG", "AL"], label: "Cambridgeshire and Surroundings" },
  { value: ["CF", "NP", "SA", "HR"], label: "Cardiff and Surroundings" },
  { value: ["EC", "WC", "W", "SW", "SE", "E", "N", "NW"], label: "Central London and Surroundings" },
  { value: ["PR", "BB", "BL", "LA"], label: "Central Lancashire and Surroundings" },
  { value: ["TR", "PL"], label: "Cornwall and Surroundings" },
  { value: ["CV", "LE", "NN", "B"], label: "Coventry & Warwickshire and Surroundings" },
  { value: ["CA", "LA", "DG"], label: "Cumbria and Surroundings" },
  { value: ["DE", "NG", "LE"], label: "Derby and Surroundings" },
  { value: ["DD", "PH", "AB"], label: "Dundee and Surroundings" },
  { value: ["DH", "DL", "TS"], label: "Durham and Surroundings" },
  { value: ["EX", "TA"], label: "East Devon and Surroundings" },
  { value: ["CT", "ME", "TN"], label: "East Kent and Surroundings" },
  { value: ["E", "IG", "RM", "DA", "N", "SE", "EC", "WC", "EN", "CM"], label: "East London and Surroundings" },
  { value: ["EH", "FK", "KY"], label: "Edinburgh and Surroundings" },
  { value: ["CM", "CO", "SS", "RM"], label: "Essex and Surroundings" },
  { value: ["G", "ML", "PA", "FK"], label: "Glasgow and Surroundings" },
  { value: ["GL", "BS", "OX"], label: "Gloucestershire and Surroundings" },
  { value: ["IV", "KW", "HS", "PH", "AB"], label: "Highlands and Surroundings" },
  { value: ["HU", "YO", "DN"], label: "Hull and Surroundings" },
  { value: ["FY", "PR", "LA"], label: "Lancashire Coast and Surroundings" },
  { value: ["LS", "WF", "BD"], label: "Leeds and Surroundings" },
  { value: ["LE", "NG", "NN"], label: "Leicester and Surroundings" },
  { value: ["LN", "PE", "NG"], label: "Lincolnshire and Surroundings" },
  { value: ["L", "CH", "WA", "WN", "PR", "LA", "FY"], label: "Liverpool and Surroundings" },
  { value: ["M", "SK", "WN", "OL", "BL", "L", "CH", "PR", "FY", "WA"], label: "Manchester and Surroundings" },
  { value: ["TS", "DL", "YO"], label: "Middlesborough and Surroundings" },
  { value: ["NE", "DH", "SR"], label: "Newcastle and Sunderland and Surroundings" },
  { value: ["NP", "CF", "HR"], label: "Newport and Surroundings" },
  { value: ["N", "NW", "EN", "E", "WC", "EC", "WD", "UB", "HA"], label: "North London and Surroundings" },
  { value: ["LL", "CH"], label: "North Wales and Surroundings" },
  { value: ["BT"], label: "North West NI and Surroundings" },
  { value: ["NN", "MK", "LE", "CV"], label: "Northamptonshire and Surroundings" },
  { value: ["NR", "PE", "IP"], label: "Norfolk and Surroundings" },
  { value: ["NG", "LE", "DE"], label: "Nottingham and Surroundings" },
  { value: ["OX", "RG", "NN"], label: "Oxfordshire and Surroundings" },
  { value: ["PE", "CB", "NG"], label: "Peterborough and Surroundings" },
  { value: ["PO", "SO", "GU"], label: "Portsmouth and Surroundings" },
  { value: ["S", "DN", "WF", "HD"], label: "Sheffield and Surroundings" },
  { value: ["SY", "TF", "WV"], label: "Shropshire and Surroundings" },
  { value: ["PL", "TQ", "EX"], label: "South Devon and Surroundings" },
  { value: ["BT"], label: "South Down & Newry and Surroundings" },
  { value: ["SE", "SW", "CR", "SM", "KT", "BR", "EC", "WC", "DA"], label: "South London and Surroundings" },
  { value: ["SO", "PO", "SP"], label: "Southampton and Surroundings" },
  { value: ["SO", "PO", "GU", "KT", "RH" , "CR" , "SM", "TW", "SL", "RG"], label: "Surrey and Surroundings" },
  { value: ["FK", "PH", "G", "ML", "EH"], label: "Stirling & Central and Surroundings" },
  { value: ["ST", "WS", "TF", "DE", "SY"], label: "Staffordshire and Surroundings" },
  { value: ["IP", "CO", "CB"], label: "Suffolk and Surroundings" },
  { value: ["SR", "DH", "NE"], label: "Sunderland and Surroundings" },
  { value: ["SA", "CF", "SY"], label: "Swansea and Surroundings" },
  { value: ["TN", "BR", "DA", "ME"], label: "West Kent and Surroundings" },
  { value: ["W", "SW", "TW", "UB", "HA", "NW", "EC", "WC", "SL"], label: "West London and Surroundings" },
  { value: ["BN", "RH", "GU", "PO"], label: "West Sussex and Surroundings" },
  { value: ["SN", "SP", "BA"], label: "Wiltshire and Surroundings" },
  { value: ["YO", "DL", "TS", "HG"], label: "Yorkshire and Surroundings" }
  ]
}

export async function updatedAreaSegments(){
  // return [
  //   { value: ["EC","WC","E","SE","SW","W","NW","N"], label: "Central London" },
  //   { value: ["DA","E","EC","EN","IG","ME","RM","SE","CM","SS"], label: "East London" },
  //   { value: ["E","EC","EN","HA","IG","N","NW","RM","WC","W"], label: "North" },
  //   { value: ["EC","EN","IG","N","NW","RM","RM","SS","WC"], label: "North East" },
  //   { value: ["EC","HA","N","WC","NW","RG","SL","SW","W","TU","UB"], label: "North West" },
  //   { value: ["BR","BN","CR","DA","E","EC","GU","KT","ME","RH","SE","SM","SW","TN","WC"], label: "South" },
  //   { value: ["BR","BN","CR","DA","E","EC","GU","KT","ME","RH","SE","SM","SW","TN","WC"], label: "South East" },
  //   { value: ["BR","CR","EC","WC","GU","KT","NW","SW","W","RG","SE","SL","SM","TW","UB"], label: "South West" },
  //   { value: ["EC","HA","N","NW","RG","SL","SM","SW","W","WC","TW","UB"], label: "West" },
  // ]
  return [    
  { value: ["AB", "DD", "PH", "IV"], label: "Aberdeen and Surroundings" },
  { value: ["BA", "BS", "SN"], label: "Bath and Surroundings" },
  { value: ["LU,", "MK", "SG"], label: "Bedfordshire and Surroundings" },
  { value: ["BT"], label: "Belfast and Surroundings" },
  { value: ["RG", "SL", "OX"], label: "Berkshire and Surroundings" },
  { value: ["B", "DY", "WS", "CV"], label: "Birmingham and Surroundings" },
  { value: ["DY", "WV", "WS", "B"], label: "Black Country and Surroundings" },
  { value: ["BD", "HX", "LS"], label: "Bradford and Surroundings" },
  { value: ["BN", "RH", "GU"], label: "Brighton and Surroundings" },
  { value: ["BS", "GL", "SN"], label: "Bristol and Surroundings" },
  { value: ["CB", "PE", "SG", "AL"], label: "Cambridgeshire and Surroundings" },
  { value: ["CF", "NP", "SA", "HR"], label: "Cardiff and Surroundings" },
  { value: ["EC", "WC", "W", "SW", "SE", "E", "N", "NW"], label: "Central London and Surroundings" },
  { value: ["PR", "BB", "BL", "LA"], label: "Central Lancashire and Surroundings" },
  { value: ["TR", "PL"], label: "Cornwall and Surroundings" },
  { value: ["CV", "LE", "NN", "B"], label: "Coventry & Warwickshire and Surroundings" },
  { value: ["CA", "LA", "DG"], label: "Cumbria and Surroundings" },
  { value: ["DE", "NG", "LE"], label: "Derby and Surroundings" },
  { value: ["DD", "PH", "AB"], label: "Dundee and Surroundings" },
  { value: ["DH", "DL", "TS"], label: "Durham and Surroundings" },
  { value: ["EX", "TA"], label: "East Devon and Surroundings" },
  { value: ["CT", "ME", "TN"], label: "East Kent and Surroundings" },
  { value: ["E", "IG", "RM", "DA", "N", "SE", "EC", "WC", "EN", "CM"], label: "East London and Surroundings" },
  { value: ["EH", "FK", "KY"], label: "Edinburgh and Surroundings" },
  { value: ["CM", "CO", "SS", "RM"], label: "Essex and Surroundings" },
  { value: ["G", "ML", "PA", "FK"], label: "Glasgow and Surroundings" },
  { value: ["GL", "BS", "OX"], label: "Gloucestershire and Surroundings" },
  { value: ["IV", "KW", "HS", "PH", "AB"], label: "Highlands and Surroundings" },
  { value: ["HU", "YO", "DN"], label: "Hull and Surroundings" },
  { value: ["FY", "PR", "LA"], label: "Lancashire Coast and Surroundings" },
  { value: ["LS", "WF", "BD"], label: "Leeds and Surroundings" },
  { value: ["LE", "NG", "NN"], label: "Leicester and Surroundings" },
  { value: ["LN", "PE", "NG"], label: "Lincolnshire and Surroundings" },
  { value: ["L", "CH", "WA", "WN", "PR", "LA", "FY"], label: "Liverpool and Surroundings" },
  { value: ["M", "SK", "WN", "OL", "BL", "L", "CH", "PR", "FY", "WA"], label: "Manchester and Surroundings" },
  { value: ["TS", "DL", "YO"], label: "Middlesborough and Surroundings" },
  { value: ["NE", "DH", "SR"], label: "Newcastle and Sunderland and Surroundings" },
  { value: ["NP", "CF", "HR"], label: "Newport and Surroundings" },
  { value: ["N", "NW", "EN", "E", "WC", "EC", "WD", "UB", "HA"], label: "North London and Surroundings" },
  { value: ["LL", "CH"], label: "North Wales and Surroundings" },
  { value: ["BT"], label: "North West NI and Surroundings" },
  { value: ["NN", "MK", "LE", "CV"], label: "Northamptonshire and Surroundings" },
  { value: ["NR", "PE", "IP"], label: "Norfolk and Surroundings" },
  { value: ["NG", "LE", "DE"], label: "Nottingham and Surroundings" },
  { value: ["OX", "RG", "NN"], label: "Oxfordshire and Surroundings" },
  { value: ["PE", "CB", "NG"], label: "Peterborough and Surroundings" },
  { value: ["PO", "SO", "GU"], label: "Portsmouth and Surroundings" },
  { value: ["S", "DN", "WF", "HD"], label: "Sheffield and Surroundings" },
  { value: ["SY", "TF", "WV"], label: "Shropshire and Surroundings" },
  { value: ["PL", "TQ", "EX"], label: "South Devon and Surroundings" },
  { value: ["BT"], label: "South Down & Newry and Surroundings" },
  { value: ["SE", "SW", "CR", "SM", "KT", "BR", "EC", "WC", "DA"], label: "South London and Surroundings" },
  { value: ["SO", "PO", "SP"], label: "Southampton and Surroundings" },
  { value: ["SO", "PO", "GU", "KT", "RH" , "CR" , "SM", "TW", "SL", "RG"], label: "Surrey and Surroundings" },
  { value: ["FK", "PH", "G", "ML", "EH"], label: "Stirling & Central and Surroundings" },
  { value: ["ST", "WS", "TF", "DE", "SY"], label: "Staffordshire and Surroundings" },
  { value: ["IP", "CO", "CB"], label: "Suffolk and Surroundings" },
  { value: ["SR", "DH", "NE"], label: "Sunderland and Surroundings" },
  { value: ["SA", "CF", "SY"], label: "Swansea and Surroundings" },
  { value: ["TN", "BR", "DA", "ME"], label: "West Kent and Surroundings" },
  { value: ["W", "SW", "TW", "UB", "HA", "NW", "EC", "WC", "SL"], label: "West London and Surroundings" },
  { value: ["BN", "RH", "GU", "PO"], label: "West Sussex and Surroundings" },
  { value: ["SN", "SP", "BA"], label: "Wiltshire and Surroundings" },
  { value: ["YO", "DL", "TS", "HG"], label: "Yorkshire and Surroundings" }
]
}

export async function jobStatus(){
  return [
    { label: 'In Progress', value: INPROGRESS_STATUS_ID },
    { label: 'On Hold', value: ONHOLD_STATUS_ID },
    { label: 'Stopped', value: STOPPED_STATUS_ID },
    { label: 'Opened', value: OPENED_STATUS_ID},
  ]
}

export async function fetchClosedStatusId() {
  return Number(process.env.CLOSED_STATUS_ID); 
}
export async function fetchDeletedStatusId() {
  return Number(process.env.DELETED_STATUS_ID); 
}
export async function fetchOpenedStatusId() {
  return Number(process.env.OPENED_STATUS_ID); 
}

export async function fetchInprogressStatusId() {
  return Number(process.env.INPROGRESS_STATUS_ID); 
}
export async function fetchOnholdStatusId() {
  return Number(process.env.ONHOLD_STATUS_ID); 
}
export async function fetchStoppedStatusId() {
  return Number(process.env.STOPPED_STATUS_ID); 
}

async function loginAPI(cred ,id,jobId) {

  const token = await generateToken();
  
  cred = {
    ...cred,
    roleId:id
  };
  const response = await fetch(`${base_Uri}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
    cache: "no-cache",
    body: JSON.stringify(cred),
  });

  const data = await response.json();

    const res = {
      data: {
        id : data.user.id,
        email : data.user.email,
        name : data.user.name,
        phone : data.user.phone,
        token: data.token,
        roleId: Number(id),
        understand:data.fresh,
        fresh : data.fresh,
        trade : data.user.trade,
        SubscriptionType : data.user.SubscriptionType?.type,
        SubscriptionId : data.user.SubscriptionType?.id,
        SubscriptionLeadCount : data.user.SubscriptionType?.leadCount,
        UsedLeadCount : data.user.leadUsed,
      },
      jobId:jobId,
    };
    
    return res;

}

export async function login(prevState, credentialsFormData) {
  const validated = loginSchema.safeParse({
    email: credentialsFormData.get("email"),
    password: credentialsFormData.get("password"),
  });

  if (!validated.success) {
    return {
      zod_errors: validated.error.flatten().fieldErrors,
    };
  }

  let resp;
  try {
    resp = await loginAPI(validated.data ,credentialsFormData.get("roleId"),credentialsFormData.get("jobId")||null);
  } catch (err) {
    return {

      other: "Invalid credentials",

    };
  }

  if (!resp?.data?.token) {
    return {
      other: "Invalid credentials token",
    };
  }

  // Decode the JWT token
  const { payload } = await jwtVerify(
    resp.data.token,
    new TextEncoder().encode(JWT_SECRET)
  );

  // Add expiry and user role
  // const expiry = Math.floor(Date.now() / 1000) + 60 * 60 ; 
  

  const userRole = resp?.data?.roleId;
  let expiry = Math.floor(Date.now() / 1000);

  if (userRole === 1) {
      expiry += 60 * 60; // 1 hour
  } else if (userRole === 2) {
      expiry += 7 * 24 * 60 * 60; // 1 week
  }
  const userEmail = resp?.data?.email;
  const userPhone = resp?.data?.phone;
  const User = resp?.data;
  const jobId = resp?.jobId;

  const updatedToken = await new SignJWT({
    ...payload,
    exp: expiry,
    role: userRole,
    email: userEmail,
    user : User
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(JWT_SECRET));
// console.log(">>>>>>>>>>>",resp.data)


let cookieMaxAge;
if (userRole === 1) {
  cookieMaxAge = 60 * 60; // 1 hour for regular users
} else if (userRole === 2) {
  cookieMaxAge = 60 * 60 * 24 * 7; // 7 days for tradespersons
} 

  // cookies().set("user", JSON.stringify(resp.data), cookieConfig);
  // cookies().set("jwt", updatedToken, cookieConfig);

  cookies().set("user", JSON.stringify(resp.data), { ...cookieConfig, maxAge: cookieMaxAge });
  cookies().set("jwt", updatedToken, { ...cookieConfig, maxAge: cookieMaxAge });

  // Sentry.captureException(`${resp.data.name} logged`);
  if (userRole === 1) {

    if(userPhone == null){
      if(jobId !== null){
        redirect(`/user/addphone?jobId=${jobId}`);
      }else{
        redirect("/user/addphone");
      }
    }else{
      if(jobId !== null){
        
        //redirect(`/user/myjobs?jobId=${jobId}`);
        redirect(`/user/myjobs/${jobId}`);
      }else{
        redirect("/user/myjobs");
      }
    }
  } else if (userRole === 2) {
    // console.log(resp.data.SubscriptionType)
    if(resp.data.SubscriptionType === "Deactivate"){
     // redirect("/tradesperson/subscription");
     redirect("/tradesperson/addphone");

    }
    // else if(resp.data.fresh){
    //   redirect("/tradesperson/profile");
    // }
    else{
      redirect("/tradesperson/home");
    }
  }else if (userRole === 3) {

    redirect("/admin");
  }
}

export async function saveUserDetails(token,email,id) {
  // console.log(token,email,id);
  // let data = { name:'user', value: {token:token,email:email,id:id},path: '/'}
  cookies().set("user", JSON.stringify({
    id: id,
    email: email,
    name: 'unknown',
    token: token,
    roleId: 1,
    // understand: true,
    // fresh: true,
    // trade: null,
    // SubscriptionType: 'Deactivate',
    // SubscriptionId: 4,
    // SubscriptionLeadCount: 0,
    // UsedLeadCount: 0
  }), cookieConfig);
  cookies().set("jwt", token, cookieConfig);
}
export async function getUserDetails() {

  const userCookie = cookies().get("user");
  if (!userCookie) {
    return null;
  }
  const userDetails = JSON.parse(userCookie.value);

  return userDetails;
}

export async function logout() {
  cookies().delete("jwt");
  cookies().delete("user");
  redirect("/login");
}

const jwtConfig = {
    secret: new TextEncoder().encode(JWT_SECRET),
};

export async function validateToken() {
  const token =  cookies().get('jwt')?.value;
  
  try{
    if(token){
      const decodedToken = (await jwtVerify(token, jwtConfig.secret)).payload;
      const currentTime = Math.floor(Date.now() / 1000);
    
      if (decodedToken.exp < currentTime) {
          cookies().delete("user");
          cookies().delete("jwt");
          redirect("/login");
      }
    }
  }catch (error){
    cookies().delete("user");
    cookies().delete("jwt");
    redirect("/login");
  }


}

