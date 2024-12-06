# frozen_string_literal: true

class ThreadsImporter
  def initialize(s3_prefix:, organization_slug:)
    @s3_prefix = s3_prefix
    @organization = Organization.find_by!(slug: organization_slug)
    @channels = Threads::Channels.new(S3_BUCKET.object("#{s3_prefix}/channels.json").get.body.read).to_a
    @threads_users = Threads::Users.new(S3_BUCKET.object("#{s3_prefix}/users.json").get.body.read).to_a
  end

  attr_reader :s3_prefix, :organization, :channels, :threads_users

  def run
    channels.each do |channel|
      channel_threads_keys = get_channel_threads_keys(channel)
      channel_threads_users = threads_users.select { |threads_user| channel.member_ids.include?(threads_user.id) }

      if channel_threads_keys.empty?
        say("No Threads in channel #{channel.name}, skipping")
        next
      end

      say("\nCreating #{channel_threads_keys.count} posts for Threads channel #{channel.name}.")

      if channel.private?
        say("\nChannel #{channel.name} is private with these members:")

        channel_threads_users.each do |threads_user|
          say("- #{threads_user.full_name} (#{threads_user.primary_email_or_fallback})")
        end
        say("")
      end

      case choice_prompt({
        "1" => "Create posts in a new #{channel.private? ? "private" : "public"} space.",
        "2" => "Create posts in an existing space. #{channel.private? ? "WARNING: Everyone with access will have access to these posts." : ""}",
        "3" => "Skip creating posts for this channel.",
      })
      when "1"
        say("What would you like to name this new space? (default: #{channel.name})")
        name = open_prompt.presence || channel.name

        project = organization.projects.create!(
          name: name,
          creator: organization.admin_memberships.first!,
          private: channel.private?,
        )

        if channel.private?
          channel_threads_users.each do |threads_user|
            project.add_member!(find_or_create_organization_member!(threads_user: threads_user), skip_notifications: true)
          end
        end
      when "2"
        say("Which space should posts be created in? (default: #{organization.general_project.name})")
        name = open_prompt.presence || organization.general_project.name
        project = organization.projects.find_by!(name: name)
      when "3"
        say("Skipping...")
        next
      end

      channel_threads_keys.each_with_index do |thread_key, index|
        ThreadsImporterPostCreationJob.perform_in(index * 2.seconds, s3_prefix, organization.slug, thread_key, project.id)
      end
    end
  end

  def create_post_from_thread(s3_key:, project_id:)
    project = Project.find(project_id)
    prefix = s3_key.split("/")[0...-1].join("/")
    thread = Threads::Thread.new(S3_BUCKET.object(s3_key).get.body.read)

    attachments = thread.blocks.map(&:attachments).flatten.map do |threads_attachment|
      Attachment.create!(**attachment_params_from_threads_attachment(s3_prefix: prefix, threads_attachment: threads_attachment))
    end.compact

    post = Post.create_post(
      params: {
        description_html: threads_markdown_to_html(thread.blocks.map(&:markdown_content_with_code_snippets).join("\n\n")),
        attachment_ids: attachments.map(&:public_id),
      },
      organization: organization,
      parent: nil,
      project: project,
      member: find_or_create_organization_member!(threads_user: threads_users.find { |tu| tu.id == thread.author_id }),
      skip_notifications: true,
    )

    # If a post doesn't have a body or attachments, it will be invalid, and we should skip it.
    return unless post.persisted?

    post.update_columns(created_at: thread.created_at, published_at: thread.created_at)
    post.attachments.update_all(created_at: thread.created_at)

    thread.comments.each_with_object({}) do |threads_comment, created_comments_by_first_block_content_id|
      content_parts = []

      thread_parent_block = thread.blocks.find { |block| block.content_id == threads_comment.blocks.first.parent_id }

      if thread_parent_block
        content_parts << thread_parent_block.markdown_content_with_code_snippets.lines.map { |line| "> #{line}" }.join("")
      end

      parent_threads_comment = thread.comments.find { |comment| comment.blocks.any? { |block| block.content_id == threads_comment.blocks.first.parent_id } }
      parent = created_comments_by_first_block_content_id[parent_threads_comment.blocks.first.content_id] if parent_threads_comment

      threads_comment.blocks.each { |block| content_parts << block.markdown_content_with_code_snippets }

      comment = Comment.create_comment(
        params: {
          body_html: threads_markdown_to_html(content_parts.join("\n\n")),
          attachments: threads_comment.blocks.map(&:attachments).flatten.map do |threads_attachment|
            attachment_params_from_threads_attachment(s3_prefix: prefix, threads_attachment: threads_attachment)
          end.compact,
        },
        member: find_or_create_organization_member!(threads_user: threads_users.find { |tu| tu.id == threads_comment.author_id }),
        subject: post,
        parent: parent,
        skip_notifications: true,
      )

      # If a comment doesn't have a body or attachments, it will be invalid, and we should skip it.
      next unless comment.persisted?

      comment.update_columns(created_at: threads_comment.created_at)

      created_comments_by_first_block_content_id[threads_comment.blocks.first.content_id] = comment
    end
  end

  private

  def say(message)
    Rails.logger.info(message)
  end

  def choice_prompt(options)
    options.each { |(key, value)| say("#{key}: #{value}") }
    response = gets.chomp

    if response.in?(options.keys)
      response
    else
      say("Invalid option")
      choice_prompt(options)
    end
  end

  def open_prompt
    gets.chomp
  end

  def get_channel_threads_keys(channel)
    S3_BUCKET.objects(prefix: "#{s3_prefix}/channels/#{channel.channel_id}").each_with_object([]) do |object, result|
      result.push(object.key) if object.key.ends_with?("thread.json")
    end
  end

  def find_or_create_organization_member!(threads_user:)
    user = User.find_or_create_by!(email: threads_user.primary_email_or_fallback.downcase) do |u|
      u.name = threads_user.full_name
      u.password = SecureRandom.hex
      u.password_confirmation = u.password
      u.skip_confirmation!
    end

    organization.memberships.find_by(user: user) || organization.memberships.create!(user: user, role_name: "member", discarded_at: Time.current)
  end

  def attachment_params_from_threads_attachment(s3_prefix:, threads_attachment:)
    original_object = S3_BUCKET.object("#{s3_prefix}/#{threads_attachment.file_id}_#{threads_attachment.download_filename}")
    attachment_file_path = organization.generate_post_s3_key(threads_attachment.mime_type)
    original_object.copy_to(bucket: S3_BUCKET.name, key: attachment_file_path)

    {
      file_path: attachment_file_path,
      file_type: threads_attachment.mime_type,
      name: threads_attachment.download_filename,
      size: threads_attachment.bytes,
    }
  rescue Aws::S3::Errors::NoSuchKey
    Rails.logger.info("Unable to find object #{original_object.key}")
    nil
  end

  def threads_markdown_to_html(threads_markdown)
    threads_markdown = threads_markdown.gsub(/\<\!\S+\>/, "").gsub(/\<@\d+\|(?<name>[^>]+)\>/) { $LAST_MATCH_INFO[:name] }

    return "" if threads_markdown.blank?

    client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
    client.markdown_to_html(markdown: threads_markdown, editor: "markdown")
  end
end
