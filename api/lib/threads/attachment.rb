# frozen_string_literal: true

module Threads
  class Attachment
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def file_id
      data["fileID"]
    end

    def download_filename
      data["downloadFilename"]
    end

    def bytes
      data["bytes"]
    end

    def mime_type
      data["mimeType"]
    end
  end
end
