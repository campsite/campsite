package main

import (
	"context"
	"flag"
	"net"
	"net/http"
	"os"
	"strings"

	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/env"
	"campsite.social/campsite/apiserver/pubsub"
	"campsite.social/campsite/apiserver/security"
	"campsite.social/campsite/apiserver/services"
	campsitev1 "campsite.social/campsite/gen/proto/campsite/v1"
	"contrib.go.opencensus.io/exporter/zipkin"
	"github.com/BurntSushi/toml"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nats-io/nats.go"
	openzipkin "github.com/openzipkin/zipkin-go"
	zipkinhttp "github.com/openzipkin/zipkin-go/reporter/http"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/rs/zerolog/pkgerrors"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/trace"
	"go.opencensus.io/zpages"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/status"
)

var (
	configFile = flag.String("config_file", "campsite.toml", "Path to config file")
)

type config struct {
	LogLevel                 string
	ListenAddr               string
	GatewayListenAddr        string
	DatabaseConnectionString string
	NatsURL                  string
	ZipkinReporterURL        string
	Debug                    struct {
		ListenAddr       string
		EnableReflection bool
		SampleAllTraces  bool
	}
}

func registerServers(grpcServer *grpc.Server, env *env.Env) {
	campsitev1.RegisterPostsServer(grpcServer, services.NewPostsServer(env))
	campsitev1.RegisterUsersServer(grpcServer, services.NewUsersServer(env))
	campsitev1.RegisterTopicsServer(grpcServer, services.NewTopicsServer(env))
}

func registerGatewayHandlers(ctx context.Context, gatewayMux *runtime.ServeMux, conn *grpc.ClientConn) error {
	if err := campsitev1.RegisterPostsHandler(ctx, gatewayMux, conn); err != nil {
		return err
	}
	if err := campsitev1.RegisterUsersHandler(ctx, gatewayMux, conn); err != nil {
		return err
	}
	if err := campsitev1.RegisterTopicsHandler(ctx, gatewayMux, conn); err != nil {
		return err
	}
	return nil
}

func errorHandler(fullMethod string, err error) error {
	if errors.Is(err, context.Canceled) {
		return status.Error(codes.Canceled, "")
	}

	if _, ok := status.FromError(err); !ok {
		log.Error().Stack().Err(err).Str("method", fullMethod).Msg("Error handling request")
		err = status.Error(codes.Unknown, "")
	}
	return err
}

func main() {
	ctx := context.Background()

	flag.Parse()
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	zerolog.ErrorStackMarshaler = pkgerrors.MarshalStack

	var c config
	if _, err := toml.DecodeFile(*configFile, &c); err != nil {
		log.Panic().Err(err).Msg("Failed to parse config")
	}

	if c.LogLevel != "" {
		logLevel, err := zerolog.ParseLevel(c.LogLevel)
		if err != nil {
			log.Panic().Err(err).Msg("Failed to parse log level")
		}
		zerolog.SetGlobalLevel(logLevel)
	}

	nc, err := nats.Connect(c.NatsURL)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to connect to nats")
	}

	pgxConfig, err := pgxpool.ParseConfig(c.DatabaseConnectionString)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to parse database connection string")
	}

	pool, err := pgxpool.ConnectConfig(ctx, pgxConfig)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to connect to database")
	}

	env := &env.Env{
		DB:     db.Wrap(pool),
		PubSub: pubsub.Wrap(nc),
	}

	grpcServer := grpc.NewServer(
		grpc.StatsHandler(&ocgrpc.ServerHandler{}),
		grpc_middleware.WithStreamServerChain(
			func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
				return errorHandler(info.FullMethod, handler(srv, stream))
			},
			func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (err error) {
				defer func() {
					if r := recover(); r != nil {
						err = errors.WithStack(errors.Errorf("panic: %s", r))
					}
				}()
				err = handler(srv, stream)
				return
			},
			security.MakeStreamServerInterceptor(env),
		),
		grpc_middleware.WithUnaryServerChain(
			func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
				resp, err := handler(ctx, req)
				if err != nil {
					return nil, errorHandler(info.FullMethod, err)
				}
				return resp, nil
			},
			func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
				defer func() {
					if r := recover(); r != nil {
						err = errors.WithStack(errors.Errorf("panic: %s", r))
					}
				}()
				resp, err = handler(ctx, req)
				return
			},
			security.MakeUnaryServerInterceptor(env),
		),
	)
	wrappedGrpc := grpcweb.WrapServer(grpcServer)

	var g errgroup.Group

	registerServers(grpcServer, env)

	if c.Debug.EnableReflection {
		reflection.Register(grpcServer)
		log.Warn().Msgf("Reflection enabled.")
	}

	{
		lis, err := net.Listen("tcp", c.ListenAddr)
		if err != nil {
			log.Panic().Err(err).Msg("Failed to listen")
		}
		g.Go(func() error {
			http.Serve(lis, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.ProtoMajor == 2 {
					wrappedGrpc.ServeHTTP(w, r)
				} else {
					w.Header().Set("Access-Control-Allow-Origin", "*")
					w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
					w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-Agent, X-Grpc-Web")
					w.Header().Set("grpc-status", "")
					w.Header().Set("grpc-message", "")
					if wrappedGrpc.IsGrpcWebRequest(r) {
						wrappedGrpc.ServeHTTP(w, r)
					}
				}
			}))
			return grpcServer.Serve(lis)
		})
		log.Info().Msgf("gRPC server running on: %s", lis.Addr())

		if c.ZipkinReporterURL != "" {
			localEndpoint, err := openzipkin.NewEndpoint("campsite", lis.Addr().String())
			if err != nil {
				log.Panic().Err(err).Msg("Failed to create local endpoint")
			}

			trace.RegisterExporter(zipkin.NewExporter(zipkinhttp.NewReporter(c.ZipkinReporterURL), localEndpoint))
			log.Info().Msgf("Zipkin tracing enabled: %+v", c.ZipkinReporterURL)
		}
	}

	if c.GatewayListenAddr != "" {
		// Start a private listener.
		privateLis, err := net.Listen("tcp", "localhost:0")
		if err != nil {
			log.Panic().Err(err).Msg("Failed to listen")
		}
		g.Go(func() error {
			return grpcServer.Serve(privateLis)
		})

		conn, err := grpc.DialContext(ctx, privateLis.Addr().String(), grpc.WithInsecure())
		if err != nil {
			log.Panic().Err(err).Msg("Failed to connect to self")
		}

		gatewayMux := runtime.NewServeMux(runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
			switch strings.ToLower(key) {
			case "authorization":
				return key, true
			default:
				return runtime.DefaultHeaderMatcher(key)
			}
		}))
		if err := registerGatewayHandlers(ctx, gatewayMux, conn); err != nil {
			log.Panic().Err(err).Msg("Failed to register gateway handlers")
		}

		lis, err := net.Listen("tcp", c.GatewayListenAddr)
		if err != nil {
			log.Panic().Err(err).Msg("Failed to listen")
		}
		g.Go(func() error {
			return http.Serve(lis, gatewayMux)
		})
		log.Info().Msgf("gRPC Gateway listening on: %s (mapped to private server on: %s)", lis.Addr(), privateLis.Addr())
	}

	if c.Debug.ListenAddr != "" {
		debugLis, err := net.Listen("tcp", c.Debug.ListenAddr)
		if err != nil {
			log.Panic().Err(err).Msg("Failed to listen")
		}

		mux := http.NewServeMux()
		zpages.Handle(mux, "/")
		g.Go(func() error {
			return http.Serve(debugLis, mux)
		})
		log.Warn().Msgf("Debug server listening on: %s", debugLis.Addr())
	}

	if c.Debug.SampleAllTraces {
		trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
		log.Warn().Msgf("All traces are being sampled.")
	}

	if err := g.Wait(); err != nil {
		log.Panic().Err(err).Msg("Failed to serve")
	}
}
