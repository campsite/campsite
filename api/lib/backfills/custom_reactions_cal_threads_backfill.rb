# frozen_string_literal: true

module Backfills
  class ThreadsReaction
    def initialize(payload)
      @data = payload
    end

    attr_reader :data

    def name
      data["name"]
    end

    def url
      data["url"]
    end
  end

  class ThreadsReactions
    def initialize(payload)
      @data = payload
    end

    attr_reader :data

    def result
      data["result"]
    end

    def to_a
      result.map { |reaction| ThreadsReaction.new(reaction) }
    end
  end

  class CustomReactionsCalThreadsBackfill
    def self.run(dry_run: true, org_slug: nil)
      threads_reactions_file = File.open("./fixtures/custom_reactions/cal.json")
      threads_reactions_file_data = JSON.parse(threads_reactions_file.read)
      threads_reactions = ThreadsReactions.new(threads_reactions_file_data)

      organization = Organization.find_by!(slug: org_slug)
      creator = organization.kept_memberships.joins(:user).find_by(user: { username: "peer" }) || organization.kept_memberships.first

      created_count = 0
      skipped_reactions = []
      failed_reactions = []
      threads_reactions.to_a.each do |reaction|
        if dry_run
          skipped_reactions.append(reaction)
          next
        end

        name = reaction.name.gsub(/\s+/, "-").downcase
        if organization.custom_reactions.exists?(name: name)
          skipped_reactions.append(reaction)
          next
        end

        tempfile = Down.download(reaction.url, max_size: 5.megabyte)
        file_type = tempfile.content_type
        key = organization.generate_avatar_s3_key(file_type)
        object = S3_BUCKET.object(key)
        object.put(body: tempfile)

        result = organization.custom_reactions.create(
          name: name,
          file_path: key,
          file_type: file_type,
          creator: creator,
        )

        if result.persisted?
          created_count += 1
          Rails.logger.info("Created CustomReaction for #{reaction.name}")
        else
          failed_reactions.append(reaction)
          Rails.logger.info("Failed to create CustomReaction for #{reaction.name}")
        end
      end

      if created_count.nonzero?
        Rails.logger.info("----------------------------------------------------------------------------------------")
        Rails.logger.info("Created #{created_count} CustomReaction #{"record".pluralize(created_count)} for #{org_slug}")
      end

      if skipped_reactions.any?
        Rails.logger.info("----------------------------------------------------------------------------------------")
        Rails.logger.info("Skipped creating #{skipped_reactions.count} CustomReaction #{"record".pluralize(failed_reactions.count)}:")
        skipped_reactions.each do |reaction|
          Rails.logger.info(reaction.name)
        end
      end

      if failed_reactions.any?
        Rails.logger.info("----------------------------------------------------------------------------------------")
        Rails.logger.info("Failed to create #{failed_reactions.count} CustomReaction #{"record".pluralize(failed_reactions.count)}:")
        failed_reactions.each do |reaction|
          Rails.logger.info(reaction.name)
        end
      end

      "Finished backfilling reactions for #{org_slug}"
    end
  end
end
