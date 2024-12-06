/****************************************************************************************
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.                    *
 * SPDX-License-Identifier: MIT-0                                                        *
 *                                                                                       *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this  *
 * software and associated documentation files (the "Software"), to deal in the Software *
 * without restriction, including without limitation the rights to use, copy, modify,    *
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to    *
 * permit persons to whom the Software is furnished to do so.                            *
 *                                                                                       *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,   *
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A         *
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT    *
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION     *
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE        *
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                *
 ****************************************************************************************/

'use strict'
const AWS = require('aws-sdk')
const querystring = require('querystring')

AWS.config.update({ region: 'us-east-1' })
const s3 = new AWS.S3()
const mediaConvert = new AWS.MediaConvert({ apiVersion: '2017-08-29' })
const conversionsInProcess = new Map() //track conversion in progress
const configManifestCacheTtl = 86400

/************************************************************************************
 ******************************** response wrapper ***********************************
 ************************************************************************************/

function createManifestWrapper(manifestBody) {
  const manifestResponse = {
    status: '200',
    statusDescription: 'OK',
    headers: {
      'access-control-allow-origin': [{ value: '*' }],
      'access-control-allow-methods': [{ value: 'GET,POST,OPTIONS' }],
      'content-type': [{ value: 'application/vnd.apple.mpegurl' }],
      'cache-control': [{ value: 'max-age=3' }] //cache set to half-length of intro video.
    },
    body: manifestBody
  }

  return manifestResponse
}

/************************************************************************************
 ***************************** generate intro manifest *******************************
 ************************************************************************************/

function createIntroManifest(qsParams) {
  const introManifestBody = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-TARGETDURATION:12',
    '#EXT-X-MEDIA-SEQUENCE:0',
    '#EXT-X-PLAYLIST-TYPE:EVENT',
    '#EXTINF:6,',
    'intro' + qsParams.width + 'x' + qsParams.height + '.ts'
  ]
  const introManifest = createManifestWrapper(introManifestBody.join('\n'))

  return introManifest
}

/************************************************************************************
 **************************** Fetch Manifest from S3 *********************************
 ************************************************************************************/

async function getManifest(qsParams, hlsBucket) {
  const bucketParams = {
    Bucket: hlsBucket,
    Key: qsParams.basefilename + qsParams.width + 'x' + qsParams.height + '.m3u8'
  }
  const manifest = await s3.getObject(bucketParams).promise()

  return manifest
}

/***********************************************************************************
 ***************** Query string parser and resolution normalizer ********************
 ************************************************************************************/

/*
 * This demo supports up to 1920x1080 resolutions based on hls recommendations:
 * https://developer.apple.com/documentation/http_live_streaming/hls_authoring_specification_for_apple_devices
 * any other resolution combination will be normalized based on the nearest height within the resolution map.
 * For example, resolution parameters of width=1050 and height=370 will be normalized to
 * width=640 and height=360.
 * The expect url format from the client is:
 * https://d1abcd.cloudfront.net/your-manifest-file768x432.m3u8?width=768&height=432&mediafilename=your-media-file.mp4
 * The url and query string format is only for demonstration purposes, change the structure for your request needs.
 * For this demo, a validation is done for manifest file name and media file name match.
 * baseFileName is the value of your-media-file regex extracted from query string omitting the file extension.
 * hlsManifestName is the value of your-manifest-file regex extracted from uri omitting the resolution and
 * file extension.
 */

function parseQueryString(queryString, reqUri) {
  //create a resolution map, keys based on height
  const resolutionsMap = {
    234: {
      width: '416',
      height: '234',
      bitrate: '145000'
    },
    360: {
      width: '640',
      height: '360',
      bitrate: '365000'
    },
    432: {
      width: '768',
      height: '432',
      bitrate: '730000'
    },
    540: {
      width: '960',
      height: '540',
      bitrate: '2000000'
    },
    720: {
      width: '1280',
      height: '720',
      bitrate: '3000000'
    },
    1080: {
      width: '1920',
      height: '1080',
      bitrate: '6000000'
    }
  }

  const parseQsForMediafileName = querystring.parse(queryString)
  const parsedQueryString = querystring.parse(queryString.toLowerCase())
  const baseFileName = /(.+?)(\.[^.]*$|$)/g.exec(parseQsForMediafileName.mediafilename)[1] //source file name
  const hlsManifestName = /[\/](.+?)(\.[^.]*$|$)/g.exec(reqUri)[1] //manifest file name

  if (baseFileName + parsedQueryString.width + 'x' + parsedQueryString.height === hlsManifestName) {
    const resolutionsHeight = [234, 360, 432, 540, 720, 1080]
    const closestResolution = (group) => (res_a, res_b) =>
      Math.abs(group - res_a) < Math.abs(group - res_b) ? res_a : res_b //normalize resolution to closes match
    const standardizedResolution = resolutionsHeight.reduce(closestResolution(parsedQueryString.height))

    //rewrite query string params
    parsedQueryString.width = resolutionsMap[standardizedResolution].width
    parsedQueryString.height = resolutionsMap[standardizedResolution].height
    parsedQueryString.bitrate = resolutionsMap[standardizedResolution].bitrate
    parsedQueryString.basefilename = baseFileName
    parsedQueryString.mediafilename = parseQsForMediafileName.mediafilename
    return parsedQueryString
  } else {
    return 'MISMATCH'
  }
}

/************************************************************************************
 ************************ Create Elemental MediaConvert job **************************
 *************************************************************************************/

/* This function receives parameters created by CloudFormation and embedded in CloudFront as Origin Custom Headers.
 * It allows to deploy Lambda@Edge in us-east-1, but still use the parameters for LAmbda@Edge invocation globally.
 * The parameters are:
 * mediaconvert api endpoint
 * mediaconvert job role
 * source media bucket
 * hls media bucket
 */

async function createMediaConvertJob(qsMediaParams, reqCustomHeaders) {
  const mediaConvertJobParams = {
    //"Queue": "arn:aws:mediaconvert:us-east-1:ACCOUNT_ID:queues/Default", //use to set queue other than default
    UserMetadata: {},
    Role: reqCustomHeaders['mediaconvert-job-role'][0].value,
    AccelerationSettings: {
      Mode: 'PREFERRED'
    },
    Settings: {
      TimecodeConfig: {
        Source: 'ZEROBASED'
      },
      OutputGroups: [
        {
          CustomName: 'HLS',
          Name: 'Apple HLS',
          Outputs: [
            {
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {
                  AudioFramesPerPes: 4,
                  PcrControl: 'PCR_EVERY_PES_PACKET',
                  PmtPid: 480,
                  PrivateMetadataPid: 503,
                  ProgramNumber: 1,
                  PatInterval: 0,
                  PmtInterval: 0,
                  Scte35Source: 'NONE',
                  NielsenId3: 'NONE',
                  TimedMetadata: 'NONE',
                  VideoPid: 481,
                  AudioPids: [482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492]
                }
              },
              VideoDescription: {
                Width: qsMediaParams.width, //set video resolution width
                ScalingBehavior: 'DEFAULT',
                Height: qsMediaParams.height, //set video resolution height
                TimecodeInsertion: 'DISABLED',
                AntiAlias: 'ENABLED',
                Sharpness: 50,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    InterlaceMode: 'PROGRESSIVE',
                    NumberReferenceFrames: 3,
                    Syntax: 'DEFAULT',
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 59,
                    Slices: 1,
                    GopBReference: 'DISABLED',
                    SlowPal: 'DISABLED',
                    SpatialAdaptiveQuantization: 'ENABLED',
                    TemporalAdaptiveQuantization: 'ENABLED',
                    FlickerAdaptiveQuantization: 'DISABLED',
                    EntropyEncoding: 'CABAC',
                    MaxBitrate: qsMediaParams.bitrate, //set video bitrate
                    FramerateControl: 'INITIALIZE_FROM_SOURCE',
                    RateControlMode: 'QVBR',
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                      QvbrQualityLevelFineTune: 0
                    },
                    CodecProfile: 'MAIN',
                    Telecine: 'NONE',
                    MinIInterval: 0,
                    AdaptiveQuantization: 'HIGH',
                    CodecLevel: 'AUTO',
                    FieldEncoding: 'PAFF',
                    SceneChangeDetect: 'ENABLED',
                    QualityTuningLevel: 'SINGLE_PASS',
                    FramerateConversionAlgorithm: 'DUPLICATE_DROP',
                    UnregisteredSeiTimecode: 'DISABLED',
                    GopSizeUnits: 'FRAMES',
                    ParControl: 'INITIALIZE_FROM_SOURCE',
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: 'DISABLED',
                    DynamicSubGop: 'STATIC'
                  }
                },
                AfdSignaling: 'NONE',
                DropFrameTimecode: 'ENABLED',
                RespondToAfd: 'NONE',
                ColorMetadata: 'INSERT'
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: 'FOLLOW_INPUT',
                  AudioSourceName: 'Audio Selector 1',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: 'NORMAL',
                      Bitrate: 96000,
                      RateControlMode: 'CBR',
                      CodecProfile: 'LC',
                      CodingMode: 'CODING_MODE_2_0',
                      RawFormat: 'NONE',
                      SampleRate: 48000,
                      Specification: 'MPEG4'
                    }
                  },
                  LanguageCodeControl: 'FOLLOW_INPUT'
                }
              ],
              OutputSettings: {
                HlsSettings: {
                  AudioGroupId: 'program_audio',
                  IFrameOnlyManifest: 'EXCLUDE'
                }
              },
              //append width and height for converted filename
              NameModifier: qsMediaParams.width + 'x' + qsMediaParams.height
            }
          ],
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              ManifestDurationFormat: 'INTEGER',
              SegmentLength: 10,
              TimedMetadataId3Period: 10,
              CaptionLanguageSetting: 'OMIT',
              //Output destination - S3 hls media bucket
              Destination: 's3://' + reqCustomHeaders['hlsmediabucket'][0].value + '/',
              TimedMetadataId3Frame: 'PRIV',
              CodecSpecification: 'RFC_4281',
              OutputSelection: 'MANIFESTS_AND_SEGMENTS',
              ProgramDateTimePeriod: 600,
              MinSegmentLength: 0,
              MinFinalSegmentLength: 0,
              DirectoryStructure: 'SINGLE_DIRECTORY',
              ProgramDateTime: 'EXCLUDE',
              SegmentControl: 'SEGMENTED_FILES',
              ManifestCompression: 'NONE',
              ClientCache: 'ENABLED',
              StreamInfResolution: 'INCLUDE'
            }
          }
        }
      ],
      AdAvailOffset: 0,
      Inputs: [
        {
          AudioSelectors: {
            'Audio Selector 1': {
              Tracks: [1],
              Offset: 0,
              DefaultSelection: 'DEFAULT',
              SelectorType: 'TRACK',
              ProgramSelection: 0
            }
          },
          FilterEnable: 'AUTO',
          PsiControl: 'USE_PSI',
          FilterStrength: 0,
          DeblockFilter: 'DISABLED',
          DenoiseFilter: 'DISABLED',
          TimecodeSource: 'ZEROBASED',
          FileInput: 's3://' + reqCustomHeaders['sourcemediabucket'][0].value + '/' + qsMediaParams.mediafilename //input video source file to convert
        }
      ]
    },

    StatusUpdateInterval: 'SECONDS_10' //used to get job status update, if waiting for status to change
  }

  const newMediaConvertJob = await mediaConvert.createJob(mediaConvertJobParams).promise() //call media convert Job

  return newMediaConvertJob
}

/************************************************************************************
 ****************************** Generate error response ******************************
 ************************************************************************************/
function generateErrorResponse(errorCode, message) {
  return {
    status: errorCode,
    headers: {
      'content-type': [{ value: 'text/plain' }],
      'access-control-allow-origin': [{ value: '*' }]
    },
    body: message
  }
}

/************************************************************************************
 ************************************ start Here *************************************
 ************************************************************************************/
exports.handler = async (event, context) => {
  const request = event.Records[0].cf.request
  const requestQueryString = request.querystring
  const requestUri = request.uri
  const queryStringParams = parseQueryString(requestQueryString, requestUri)
  const customHeaders = request.origin.s3.customHeaders
  //Passing hls Media Bucket name and MediaConvert endpoint via CloudFront custom headers, created by CloudFormation
  const hlsMediaBucket = customHeaders['hlsmediabucket'][0].value

  mediaConvert.endpoint = customHeaders['mediaconvert-api-endpoint'][0].value

  if (queryStringParams === 'MISMATCH') {
    return generateErrorResponse(404, 'parameters mismatch - Source Video Filename and HLS Stream manifest')
  }

  try {
    //call get manifest with query string params, to fetch the manifest from S3
    const manifest = await getManifest(queryStringParams, hlsMediaBucket)

    //if manifest is complete, use wrapper to add headers and return it
    if (manifest.Body.toString('utf-8').match('EXT-X-ENDLIST')) {
      const manifestBody = manifest.Body.toString('utf-8')
      const responseManifestTypeVod = createManifestWrapper(manifestBody)
      //override cache-control header for how long you want the manifest in CloudFront cache

      responseManifestTypeVod.headers['cache-control'][0].value = 'maxage =' + configManifestCacheTtl

      //remove current conversion from global variable
      conversionsInProcess.delete(queryStringParams.basefilename + queryStringParams.height)

      return responseManifestTypeVod
    } else {
      //Manifest is not complete, change playlist type to EVENT. Clients should request refreshed manifest.
      const modifiedManifestBody = manifest.Body.toString('utf-8').replace('VOD', 'EVENT')
      const responseManifestTypeEvent = createManifestWrapper(modifiedManifestBody)

      return responseManifestTypeEvent
    }
  } catch (err) {
    /*
     * In case that a player sends multiple requests for the same rendition in a very short time,
     * we want to avoid reinvoking the same mediaConvert job.
     * Here we use conversionsInProcess map with objects construct of:
     * {
     *    Key: basefilename+height,
     *    value: {MediaConvert jobId, MediaConvert jobId status}
     * }
     * Every job parameters are added to the map at first time the rendition is requested.
     * The job parameters are removed from the map when the complete manifest is served
     * (manifest includes "EXT-X-ENDLIST").
     * Please note - this is for demo purposes only. For a wide scale deployment it is recommended to
     * track conversion in process in external map.
     */

    //check if manifest was not found and a job with the same parameters is not currently in process.
    if (err.statusCode == 404 && !conversionsInProcess.has(queryStringParams.basefilename + queryStringParams.height)) {
      // send parameters to media convert to create a job for conversion
      const mediaConvertJob = await createMediaConvertJob(queryStringParams, customHeaders)

      //check MediaConvert response object if job status is submitted
      if (mediaConvertJob.Job.Status == 'SUBMITTED') {
        //add conversion job to conversion in process global variable
        conversionsInProcess.set(queryStringParams.basefilename + queryStringParams.height, {
          jobId: mediaConvertJob.Job.Id,
          status: mediaConvertJob.Job.Status
        })

        //Generate and serve intro manifest while MediaConvert generates initial playlist manifest and segments
        return createIntroManifest(queryStringParams)
      } else {
        //This is first request, but job couldn't be submitted
        return generateErrorResponse(404, 'MediaConvert job submission failed. Check MediaConvert log')
      }
      //this is a repeat request, check conversion job process status and update global conversion map
    } else if (conversionsInProcess.get(queryStringParams.basefilename + queryStringParams.height).status !== 'ERROR') {
      const currentJobId = conversionsInProcess.get(queryStringParams.basefilename + queryStringParams.height).jobId

      // Check mediaConvert job status and update global variable
      const getMcJobStatus = await mediaConvert.getJob({ Id: currentJobId }).promise()

      conversionsInProcess.set(queryStringParams.basefilename + queryStringParams.height, {
        jobId: currentJobId,
        status: getMcJobStatus.Job.Status
      })

      //serve intro manifest again while MediaConvert is in initial process
      return createIntroManifest(queryStringParams)
    } else {
      //There was an error during MediaConvert initial process
      return generateErrorResponse(404, 'Could not convert the requested media, Check MediaConvert log')
    }
  }
}
