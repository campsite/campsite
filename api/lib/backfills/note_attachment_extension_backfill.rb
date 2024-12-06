# frozen_string_literal: true

module Backfills
  class NoteAttachmentExtensionBackfill
    def self.run(dry_run: true, org_slug: nil)
      updated_notes_count = 0
      updated_attachments_count = 0

      scope = Note.where("description_html LIKE ?", "%<note-attachment%")

      if org_slug
        scope = scope.joins(member: :organization)
          .where(member: { organization: Organization.find_by(slug: org_slug) })
      end

      scope.each do |note|
        updated_notes_count += 1

        parsed_description = Nokogiri::HTML.fragment(note.description_html)

        parsed_description.css("note-attachment").each do |node|
          updated_attachments_count += 1

          file_type = node.attr("type")
          file_path = node.attr("path")
          width = node.attr("width")
          height = node.attr("height")
          duration = node.attr("duration")
          preview_file_path = node.attr("cover_path")

          next if dry_run

          if file_type.blank? || file_path.blank?
            node.remove
            next
          end

          attachment = note.attachments.create_or_find_by!(
            file_type: file_type,
            file_path: file_path,
            duration: duration,
            preview_file_path: preview_file_path,
            width: width,
            height: height,
          )

          attachment_node = Nokogiri::XML::Node.new("post-attachment", parsed_description)
          attachment_node["id"] = attachment.public_id
          attachment_node["file_type"] = attachment.file_type
          attachment_node["width"] = attachment.width
          attachment_node["height"] = attachment.height

          node.replace(attachment_node)
        end

        next if dry_run

        note.update_columns(
          description_html: parsed_description.to_s,
          description_state: nil,
        )
      end

      "#{dry_run ? "Would have updated" : "updated"} #{updated_notes_count} notes and #{updated_attachments_count} attachments"
    end
  end
end
