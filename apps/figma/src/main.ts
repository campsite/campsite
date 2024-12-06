import { showUI } from '@create-figma-plugin/utilities'

import { exportNode, generatePreviews } from './core/export'
import { $figma } from './core/figma'
import { LaunchCommand } from './types'
import { PluginProps } from './ui'

function getTitle() {
  const titleParts = [figma.root.name ?? 'Figma Export']

  // Only include page name if it is not the default assigned by Figma
  if (!figma.currentPage.name.match(/^Page [0-9]+$/)) {
    titleParts.push(figma.currentPage.name)
  }

  return titleParts.join(' — ')
}

async function getProjectByOrganization(organization: string) {
  const projects = (await figma.clientStorage.getAsync('projects')) ?? {}

  return projects[organization]
}

export async function run(command: LaunchCommand) {
  /**
   * Sets up the initial UI.
   * Do NOT include any event listeners here.
   */
  async function setup() {
    const props: PluginProps = {
      command,
      token: await figma.clientStorage.getAsync('campsite-token')
    }

    showUI({ width: 350, height: 500 }, props)
  }

  // MARK: - Custom event listeners

  $figma.on('signin', async (token) => {
    await figma.clientStorage.setAsync('campsite-token', token)
    $figma.emit('tokenchange', token)
  })

  $figma.on('signout', async () => {
    await figma.clientStorage.deleteAsync('campsite-token')
    await figma.clientStorage.deleteAsync('organization')
    await figma.clientStorage.deleteAsync('projects')
    $figma.emit('tokenchange', undefined)
  })

  $figma.on('appready', async () => {
    const fileKey = figma.root.getPluginData('fileKey')
    const organization = await figma.clientStorage.getAsync('organization')

    $figma.emit('initialdata', {
      organization: organization,
      project: await getProjectByOrganization(organization),
      title: getTitle(),
      fileKey,
      previews: await generatePreviews(figma.currentPage.selection)
    })
  })

  $figma.on('organizationchange', async (organization) => {
    await figma.clientStorage.setAsync('organization', organization)

    $figma.emit('initialdata', {
      project: await getProjectByOrganization(organization)
    })
  })

  $figma.on('projectchange', async (data) => {
    const projects = (await figma.clientStorage.getAsync('projects')) ?? {}

    projects[data.organization] = data.project

    await figma.clientStorage.setAsync('projects', projects)
  })

  $figma.on('filekeychange', async (fileKey) => {
    figma.root.setPluginData('fileKey', fileKey)
  })

  $figma.on('submitstart', async () => {
    const name = figma.root.name

    $figma.emit('metadataready', { name })
  })

  $figma.on('uploadstart', async () => {
    await Promise.allSettled(
      figma.currentPage.selection.map(async (node) => {
        const exportedNode = await exportNode(node, { type: 'PNG', scale: 2 })

        $figma.emit('exportready', exportedNode)
      })
    )

    $figma.emit('exportend')
  })

  // MARK: - Figma event listeners

  figma.on('selectionchange', async () => {
    const previews = await generatePreviews(figma.currentPage.selection)

    $figma.emit('previewready', previews)
    $figma.emit('titlechange', getTitle())
  })

  // MARK: - Run setup

  setup()
  $figma.on('refresh', setup)
}

function main() {
  return run('quick-post')
}

export default main
