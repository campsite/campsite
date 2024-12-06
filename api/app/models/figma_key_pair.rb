# frozen_string_literal: true

class FigmaKeyPair < ApplicationRecord
  encrypts :read_key, deterministic: true
  encrypts :write_key, deterministic: true

  def channel_name
    "private-figma-#{read_key}"
  end

  def self.generate
    FigmaKeyPair.create!(
      read_key: SecureRandom.uuid,
      write_key: SecureRandom.uuid,
    )
  end

  def authenticate(user)
    # very basic figma token generation
    app = user.oauth_applications.find_or_create_by(
      name: "figma-plugin",
      provider: :figma,
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      confidential: true,
      scopes: "read_organization write_post write_project",
    )

    access_token = app.access_tokens.build(
      resource_owner: user,
      expires_in: Doorkeeper.configuration.access_token_expires_in.to_i,
      scopes: app.scopes,
    )
    access_token.use_refresh_token = true
    access_token.save!

    # broadcast the token to the channel
    PusherTriggerJob.perform_async(channel_name, "token", access_token.plaintext_token.to_json)
    # And immediately destroy the token
    destroy!
  end
end
