# frozen_string_literal: true

class CustomReactionsPack
  include ActiveModel::Model

  class CustomReactionPacksItem
    include ActiveModel::Model
    include ImgixUrlBuilder

    attr_accessor :file_path

    def name
      return if file_path.nil?

      @name ||= file_path.split("/").last.split(".").first
    end

    def file_url
      return if file_path.nil?

      build_imgix_url(file_path)
    end

    def file_type
      return if file_path.nil?

      @file_type ||= begin
        extension = File.extname(file_path).delete_prefix(".")
        Attachment::FILE_TYPES_TO_EXTENSION.invert[extension]
      end
    end
  end

  attr_accessor :name, :organization

  validates :name, presence: true, inclusion: { in: CustomReaction.packs.keys }

  def installed?
    organization.custom_reactions.any? { |reaction| reaction.pack == name }
  end

  def items
    @items ||= S3_BUCKET.objects(prefix: self.class.s3_url(name))
      .reject { |object| object.key.end_with?("/") } # Filter out root directories
      .map do |object|
      CustomReactionPacksItem.new(file_path: object.key)
    end
  end

  def self.all(organization:)
    CustomReaction.packs.keys.map do |name|
      pack = CustomReactionsPack.new(name: name, organization: organization)
      pack.validate!
      pack
    end
  end

  def self.install!(name:, organization:, creator:)
    pack = CustomReactionsPack.new(name: name, organization: organization)
    pack.validate!

    return if pack.installed?

    pack.items.each do |item|
      organization.custom_reactions.create!(
        name: item.name,
        file_path: item.file_path,
        file_type: item.file_type,
        creator: creator,
        pack: pack.name,
      )
    rescue ActiveRecord::RecordInvalid
      # No-op when reaction uniqueness validation fails
    end
  end

  def self.uninstall!(name:, organization:)
    pack = CustomReactionsPack.new(name: name, organization: organization)
    pack.validate!

    return unless pack.installed?

    organization.custom_reactions.where(pack: name).delete_all

    # update preloaded reactions that were removed
    organization.custom_reactions = organization.custom_reactions.select { |reaction| reaction.pack != name }
  end

  def self.s3_url(name)
    "custom-reactions-packs/#{name}"
  end
end
