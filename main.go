package main

import (
	"context"
	"flag"
	"net"
	"net/http"
	"os"

	"campsite.rocks/campsite/env"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/security"
	"campsite.rocks/campsite/services"
	"github.com/BurntSushi/toml"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/rs/zerolog/pkgerrors"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/zpages"
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
	DatabaseConnectionString string
	Debug                    struct {
		ListenAddr       string
		EnableReflection bool
	}
}

func registerServers(grpcServer *grpc.Server, env *env.Env) {
	campsitev1.RegisterPostsServer(grpcServer, services.NewPostsServer(env))
	campsitev1.RegisterUsersServer(grpcServer, services.NewUsersServer(env))
	campsitev1.RegisterTopicsServer(grpcServer, services.NewTopicsServer(env))
}

func errorHandler(fullMethod string, err error) error {
	if _, ok := status.FromError(err); !ok {
		log.Error().Stack().Err(err).Str("method", fullMethod).Msg("Error handling request")
		err = status.Error(codes.Unknown, "")
	}
	return err
}

func main() {
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

	pgxConfig, err := pgxpool.ParseConfig(c.DatabaseConnectionString)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to parse config string")
	}

	db, err := pgxpool.ConnectConfig(context.Background(), pgxConfig)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to connect to database")
	}

	env := &env.Env{
		DB: db,
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
	registerServers(grpcServer, env)

	if c.Debug.ListenAddr != "" {
		debugLis, err := net.Listen("tcp", c.Debug.ListenAddr)
		if err != nil {
			log.Panic().Err(err).Msg("Failed to listen")
		}

		mux := http.NewServeMux()
		zpages.Handle(mux, "/")
		go http.Serve(debugLis, mux)

		log.Warn().Msgf("Started debug server: %s", debugLis.Addr())
	}

	if c.Debug.EnableReflection {
		reflection.Register(grpcServer)
		log.Warn().Msgf("Reflection enabled.")
	}

	lis, err := net.Listen("tcp", c.ListenAddr)
	if err != nil {
		log.Panic().Err(err).Msg("Failed to listen")
	}
	log.Info().Msgf("Listening on: %s", lis.Addr())

	grpcServer.Serve(lis)
}
