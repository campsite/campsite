# frozen_string_literal: true

class UpdateFigmaUserJob < BaseJob
  sidekiq_options queue: "background"

  def perform(integration_id)
    integration = Integration.find(integration_id)
    figma_client = FigmaClient.new(integration.token!)
    api_figma_user = figma_client.me
    database_figma_user = integration.owner.figma_user || integration.owner.build_figma_user

    database_figma_user.update!(
      remote_user_id: api_figma_user.id,
      handle: api_figma_user.handle,
      email: api_figma_user.email,
      img_url: api_figma_user.img_url,
    )
  end
end
