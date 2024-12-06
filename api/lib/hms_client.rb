# frozen_string_literal: true

class HmsClient
  def initialize(app_access_key:, app_secret:)
    @app_access_key = app_access_key
    @app_secret = app_secret
  end

  def create_room
    Hms::Room.new(post("/v2/rooms").body)
  end

  def stop_recording_for_room(room_id)
    post("/v2/recordings/room/#{room_id}/stop")
  end

  private

  def post(path, body = {})
    connection.post(path, body.to_json)
  end

  def connection
    @connection ||= Faraday.new(
      url: "https://api.100ms.live/",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer #{management_token}",
      },
    ) do |f|
      f.response(:raise_error)
      f.response(:json)
    end
  end

  def management_token
    return @management_token if defined?(@management_token)

    now = Time.current
    exp = now + 86400
    payload = {
      access_key: Rails.application.credentials.hms.app_access_key,
      type: "management",
      version: 2,
      jti: SecureRandom.uuid,
      iat: now.to_i,
      nbf: now.to_i,
      exp: exp.to_i,
    }

    @management_token = JWT.encode(payload, Rails.application.credentials.hms.app_secret, "HS256")
  end
end
