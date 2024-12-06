# frozen_string_literal: true

class DataExportJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(export_id)
    export = DataExport.find(export_id)
    export.perform
  end
end
