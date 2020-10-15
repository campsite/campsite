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
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/rs/zerolog/pkgerrors"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/zpages"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
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

	authFunc := security.MakeAuthFunc(env)

	grpcServer := grpc.NewServer(
		grpc.StatsHandler(&ocgrpc.ServerHandler{}),
		grpc_middleware.WithStreamServerChain(
			grpc_auth.StreamServerInterceptor(authFunc),
		),
		grpc_middleware.WithUnaryServerChain(
			grpc_auth.UnaryServerInterceptor(authFunc),
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
