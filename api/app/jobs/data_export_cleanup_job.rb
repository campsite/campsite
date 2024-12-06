# frozen_string_literal: true

class DataExportCleanupJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(export_id)
    DataExport.find(export_id).cleanup!
  end
end
