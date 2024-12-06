import { ChangeSet } from '@tiptap/pm/changeset'
import { Mapping, Transform } from '@tiptap/pm/transform'

import { recreateTransform } from './recreate'

export function mergeTransforms(tr1, tr2, automerge = true, rebase = false, wordDiffs = false) {
  // Create conflicting steps. Make sure the steps are only ReplaceSteps so they can easily
  // be presented as alternatives to the user.
  const { tr, changes, tr1NoConflicts, tr2NoConflicts } = automerge
      ? automergeTransforms(tr1, tr2)
      : noAutomergeTransforms(tr1, tr2),
    // Find TRs that move from the docs that come out of the non-conflicting docs to the actual final docs, then map
    // them to the ending of tr.
    tr1Conflict = mapTransform(
      recreateTransform(tr1NoConflicts.doc, tr1.doc, false, wordDiffs),
      tr.doc,
      new Mapping(tr1NoConflicts.mapping.invert().maps.concat(tr.mapping.maps))
    )
  const tr2Conflict = mapTransform(
    recreateTransform(tr2NoConflicts.doc, tr2.doc, false, wordDiffs),
    tr.doc,
    new Mapping(tr2NoConflicts.mapping.invert().maps.concat(tr.mapping.maps))
  )

  if (rebase) {
    // rebase on tr1.doc -- makes all changes relative to user 1
    return rebaseMergedTransform(tr1.doc, tr1Conflict.doc, tr2Conflict.doc, wordDiffs)
  } else {
    const conflicts = findConflicts(tr1Conflict, tr2Conflict),
      { inserted, deleted, conflictingSteps1, conflictingSteps2 } = createConflictingChanges(tr1Conflict, tr2Conflict)

    return {
      tr,
      merge: new Merge(tr.doc, changes, conflicts, conflictingSteps1, conflictingSteps2, { inserted, deleted })
    }
  }
}

function rebaseMergedTransform(doc, nonConflictingDoc, conflictingDoc, wordDiffs) {
  const trNonConflict = recreateTransform(doc, nonConflictingDoc, true, wordDiffs),
    changes = ChangeSet.create(doc, { compare: (a, b) => false }).addSteps(
      nonConflictingDoc,
      trNonConflict.mapping.maps,
      { user: 2 }
    ),
    trConflict = recreateTransform(nonConflictingDoc, conflictingDoc, false, wordDiffs),
    { inserted, deleted, conflictingSteps2 } = createConflictingChanges(new Transform(trNonConflict.doc), trConflict)

  return {
    tr: trNonConflict,
    merge: new Merge(trNonConflict.doc, changes, [], [], conflictingSteps2, { inserted, deleted })
  }
}

export class Merge {
  constructor(
    doc,
    changes,
    conflicts = [],
    conflictingSteps1 = [],
    conflictingSteps2 = [],
    conflictingChanges = { inserted: [], deleted: [] }
  ) {
    this.doc = doc
    this.changes = changes
    this.conflicts = conflicts
    this.conflictingSteps1 = conflictingSteps1
    this.conflictingSteps2 = conflictingSteps2
    this.conflictingChanges = conflictingChanges
  }

  map(mapping, doc) {
    let conflictingSteps1 = this.conflictingSteps1,
      conflictingSteps2 = this.conflictingSteps2,
      conflicts = this.conflicts,
      inserted = this.conflictingChanges.inserted,
      deleted = this.conflictingChanges.deleted
    const changes = this.changes.addSteps(doc, mapping.maps, { user: 2 })

    conflictingSteps1 = conflictingSteps1
      .map(([index, conflictStep]) => {
        const mapped = conflictStep.map(mapping)

        if (mapped) {
          inserted = inserted.map((inserted) => ({
            data: inserted.data,
            slice: inserted.slice,
            pos: mapping.map(inserted.pos)
          }))
          deleted = deleted.map((deleted) => ({
            data: deleted.data,
            from: mapping.map(deleted.from),
            to: mapping.map(deleted.to)
          }))
          return [index, mapped]
        } else {
          conflicts = conflicts.filter((conflict) => conflict[0] !== index)
          inserted = inserted.filter((inserted) => inserted.data.user !== 1 || inserted.data.index !== index)
          deleted = deleted.filter((deleted) => deleted.data.user !== 1 || deleted.data.index !== index)
          return false
        }
      })
      .filter((step) => step)

    conflictingSteps2 = conflictingSteps2
      .map(([index, conflictStep]) => {
        const mapped = conflictStep.map(mapping)

        if (mapped) {
          inserted = inserted.map((inserted) => ({
            data: inserted.data,
            slice: inserted.slice,
            pos: mapping.map(inserted.pos)
          }))
          deleted = deleted.map((deleted) => ({
            data: deleted.data,
            from: mapping.map(deleted.from),
            to: mapping.map(deleted.to)
          }))
          return [index, mapped]
        } else {
          conflicts = conflicts.filter((conflict) => conflict[1] !== index)
          inserted = inserted.filter((inserted) => inserted.data.user !== 2 || inserted.data.index !== index)
          deleted = deleted.filter((deleted) => deleted.data.user !== 2 || deleted.data.index !== index)
          return false
        }
      })
      .filter((step) => step)

    return new Merge(doc, changes, conflicts, conflictingSteps1, conflictingSteps2, { inserted, deleted })
  }

  apply(user, index) {
    const step =
        user === 1
          ? this.conflictingSteps1.find(([conflictIndex, conflictStep]) => conflictIndex === index)[1]
          : this.conflictingSteps2.find(([conflictIndex, conflictStep]) => conflictIndex === index)[1],
      map = step.getMap(),
      tr = new Transform(this.doc)

    let conflictingSteps1 = this.conflictingSteps1,
      conflictingSteps2 = this.conflictingSteps2,
      conflicts = this.conflicts

    tr.step(step)

    const changes = this.changes.addSteps(tr.doc, [map], { user })

    if (user === 1) {
      conflictingSteps1 = conflictingSteps1
        .map(([conflictIndex, conflictStep]) =>
          conflictIndex === index ? false : [conflictIndex, conflictStep.map(map)]
        )
        .filter((step) => step)
      conflicts = conflicts.filter((conflict) => conflict[0] !== index)
    } else {
      conflictingSteps2 = conflictingSteps2
        .map(([conflictIndex, conflictStep]) =>
          conflictIndex === index ? false : [conflictIndex, conflictStep.map(map)]
        )
        .filter((step) => step)
      conflicts = conflicts.filter((conflict) => conflict[1] !== index)
    }

    const conflictingChanges = {
      inserted: this.conflictingChanges.inserted
        .filter((inserted) => inserted.data.user !== user || inserted.data.index !== index)
        .map((inserted) => ({ data: inserted.data, slice: inserted.slice, pos: map.map(inserted.pos) })),
      deleted: this.conflictingChanges.deleted
        .filter((deleted) => deleted.data.user !== user || deleted.data.index !== index)
        .map((deleted) => ({ data: deleted.data, from: map.map(deleted.from), to: map.map(deleted.to) }))
    }

    return {
      tr,
      merge: new Merge(tr.doc, changes, conflicts, conflictingSteps1, conflictingSteps2, conflictingChanges)
    }
  }

  reject(user, index) {
    let conflictingSteps1 = this.conflictingSteps1,
      conflictingSteps2 = this.conflictingSteps2,
      conflicts = this.conflicts

    if (user === 1) {
      conflictingSteps1 = conflictingSteps1
        .map(([conflictIndex, conflictStep]) => (conflictIndex === index ? false : [conflictIndex, conflictStep]))
        .filter((step) => step)
      conflicts = conflicts.filter((conflict) => conflict[0] !== index)
    } else {
      conflictingSteps2 = conflictingSteps2
        .map(([conflictIndex, conflictStep]) => (conflictIndex === index ? false : [conflictIndex, conflictStep]))
        .filter((step) => step)
      conflicts = conflicts.filter((conflict) => conflict[1] !== index)
    }

    const conflictingChanges = {
      inserted: this.conflictingChanges.inserted.filter(
        (inserted) => inserted.data.user !== user || inserted.data.index !== index
      ),
      deleted: this.conflictingChanges.deleted.filter(
        (deleted) => deleted.data.user !== user || deleted.data.index !== index
      )
    }

    return {
      merge: new Merge(this.doc, this.changes, conflicts, conflictingSteps1, conflictingSteps2, conflictingChanges)
    }
  }

  applyAll(user) {
    const steps = this.conflictingSteps.map(([index, step]) => step),
      tr = new Transform(this.doc)

    let changes = this.changes

    while (steps.length) {
      const mapped = steps.pop().map(tr.mapping)

      if (mapped && !tr.maybeStep(mapped).failed) {
        changes = this.changes.addSteps(tr.doc, [tr.mapping.maps[tr.mapping.maps.length - 1]], { user })
      }
    }
    return { tr, merge: new Merge(tr.doc, changes) }
  }
}

function mapTransform(tr, doc, map) {
  const newTr = new Transform(doc)

  tr.steps.forEach((step) => {
    const mapped = step.map(map)

    if (mapped) {
      try {
        newTr.maybeStep(mapped)
      } catch (error) {
        if (!error.name === 'ReplaceError') {
          throw error
        }
      }
    }
  })
  return newTr
}

function trDoc(tr, index = 0) {
  return tr.docs.length > index ? tr.docs[index] : tr.doc
}

function noAutomergeTransforms(tr1, tr2) {
  const doc = trDoc(tr1)

  return {
    tr: new Transform(doc),
    changes: ChangeSet.create(doc, { compare: (a, b) => false }),
    tr1NoConflicts: new Transform(doc),
    tr2NoConflicts: new Transform(doc)
  }
}

function automergeTransforms(tr1, tr2) {
  // Merge all non-conflicting steps with changes marked.
  const doc = trDoc(tr1),
    conflicts = findConflicts(tr1, tr2),
    tr = new Transform(doc)

  let changes = ChangeSet.create(doc, { compare: (a, b) => false })
  const tr1NoConflicts = removeConflictingSteps(
      tr1,
      conflicts.map((conflict) => conflict[0])
    ),
    tr2NoConflicts = removeConflictingSteps(
      tr2,
      conflicts.map((conflict) => conflict[1])
    )

  tr1NoConflicts.steps.forEach((step) => tr.maybeStep(step))
  const numberSteps1 = tr.steps.length

  changes = changes.addSteps(tr.doc, tr.mapping.maps, { user: 1 })
  tr2NoConflicts.steps.forEach((step) => {
    const mapped = step.map(tr.mapping.slice(0, numberSteps1))

    if (mapped) {
      tr.maybeStep(mapped)
    }
  })
  changes = changes.addSteps(tr.doc, tr.mapping.maps.slice(numberSteps1), { user: 2 })

  return { tr, changes, tr1NoConflicts, tr2NoConflicts }
}

function removeConflictingSteps(tr, conflicts) {
  const doc = trDoc(tr),
    newTr = new Transform(doc),
    removedStepsMap = new Mapping()

  tr.steps.forEach((step, index) => {
    const mapped = step.map(removedStepsMap)

    if (!mapped) {
      return null // returning null to make linter happy (no-useless-return).
    } else if (conflicts.includes(index)) {
      removedStepsMap.appendMap(mapped.invert(newTr.doc).getMap())
    } else {
      newTr.maybeStep(mapped)
    }
  })
  return newTr
}

function findConflicts(tr1, tr2) {
  const changes1 = findContentChanges(tr1),
    changes2 = findContentChanges(tr2),
    conflicts = []

  changes1.deleted.forEach((deleted) => {
    changes2.inserted.forEach((inserted) => {
      if (inserted.pos >= deleted.from && inserted.pos <= deleted.to) {
        conflicts.push([deleted.data.step, inserted.data.step])
      }
    })
  })

  changes2.deleted.forEach((deleted) => {
    changes1.inserted.forEach((inserted) => {
      if (inserted.pos >= deleted.from && inserted.pos <= deleted.to) {
        conflicts.push([inserted.data.step, deleted.data.step])
      }
    })
  })

  changes1.inserted.forEach((inserted1) => {
    changes2.inserted.forEach((inserted2) => {
      if (inserted1.pos === inserted2.pos) {
        conflicts.push([inserted1.data.step, inserted2.data.step])
      }
    })
  })

  changes1.deleted.forEach((deleted1) => {
    changes2.deleted.forEach((deleted2) => {
      if (
        (deleted1.from >= deleted2.from && deleted1.from <= deleted2.to) ||
        (deleted1.to >= deleted2.from && deleted1.to <= deleted2.to) ||
        (deleted1.from <= deleted2.from && deleted1.to >= deleted2.to) ||
        (deleted2.from <= deleted1.from && deleted2.to >= deleted1.to)
      ) {
        conflicts.push([deleted1.data.step, deleted2.data.step])
      }
    })
  })

  return conflicts
}

function findContentChanges(tr) {
  const doc = trDoc(tr)

  let changes = ChangeSet.create(doc, { compare: (a, b) => false })

  tr.steps.forEach((step, index) => {
    const doc = trDoc(tr, index + 1)

    changes = changes.addSteps(doc, [tr.mapping.maps[index]], { step: index })
  })
  const invertedMapping = new Mapping()

  invertedMapping.appendMappingInverted(tr.mapping)
  const inserted = changes.inserted.map((inserted) => ({
    pos: invertedMapping.map(inserted.from),
    data: inserted.data
  }))
  const deleted = changes.deleted.map((deleted) => ({ from: deleted.from, to: deleted.to, data: deleted.data }))

  return { inserted, deleted }
}

function createConflictingChanges(tr1Conflict, tr2Conflict) {
  const doc = trDoc(tr1Conflict),
    // We map the steps so that the positions are all at the level of the current
    // doc as there is no guarantee for the order in which they will be applied.
    // If one of them is being applied, the other ones will have to be remapped.
    conflictingSteps1 = tr1Conflict.steps.map((step, index) => [
      index,
      step.map(new Mapping(tr1Conflict.mapping.maps.slice(0, index)).invert())
    ]),
    conflictingSteps2 = tr2Conflict.steps.map((step, index) => [
      index,
      step.map(new Mapping(tr2Conflict.mapping.maps.slice(0, index)).invert())
    ])

  let inserted = [],
    deleted = []
  const iter = [
    { steps: conflictingSteps1, user: 1 },
    { steps: conflictingSteps2, user: 2 }
  ]

  iter.forEach(({ steps, user }) =>
    steps.forEach(([index, step]) => {
      if (!step) {
        return
      }
      const stepResult = step.apply(doc)
      // We need the potential changes if this step was to be applied. We find
      // the inversion of the change so that we can place it in the current doc.
      const invertedStepChanges = ChangeSet.create(stepResult.doc, { compare: (a, b) => false }).addSteps(
        doc,
        [step.invert(doc).getMap()],
        { index, user }
      )

      deleted = deleted.concat(
        invertedStepChanges.inserted.map((inserted) => ({ from: inserted.from, to: inserted.to, data: inserted.data }))
      )
      inserted = inserted.concat(
        invertedStepChanges.deleted.map((deleted) => ({ pos: deleted.pos, slice: deleted.slice, data: deleted.data }))
      )
    })
  )
  return { inserted, deleted, conflictingSteps1, conflictingSteps2 }
}
