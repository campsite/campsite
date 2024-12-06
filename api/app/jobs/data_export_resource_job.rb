# frozen_string_literal: true

class DataExportResourceJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  sidekiq_retries_exhausted do |msg|
    export_resource_id = msg["args"].first
    DataExportResource.where(id: export_resource_id)
      .update_all(status: :error, completed_at: Time.current)
  end

  def perform(export_resource_id)
    export_resource = DataExportResource.eager_load(:data_export).find(export_resource_id)
    export_resource.perform
  end
end
