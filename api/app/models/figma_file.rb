# frozen_string_literal: true

class FigmaFile < ApplicationRecord
  validates :remote_file_key, presence: true, uniqueness: true
  validates :name, presence: true

  def remote_url
    "https://www.figma.com/file/#{remote_file_key}"
  end
end
