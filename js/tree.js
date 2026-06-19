const TreeVisualizer = (() => {
  let svg, g, zoom;
  let activeMemberId = null;
  let onNodeClick = null;
  let onContextMenu = null;
  let tooltip = null;
  const dragPositions = {};

  function init(containerId, clickCallback, contextCallback) {
    onNodeClick = clickCallback;
    onContextMenu = contextCallback;
    const container = document.getElementById(containerId);

    tooltip = document.createElement('div');
    tooltip.className = 'tree-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    container.appendChild(svg);

    const svgEl = d3.select(svg);
    g = svgEl.append('g').attr('class', 'tree-group');

    zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svgEl.call(zoom);
    svgEl.on('dblclick.zoom', null);

    svgEl.on('click', (event) => {
      if (event.target.tagName === 'svg') {
        hideTooltip();
      }
    });
    svgEl.on('contextmenu', (event) => {
      if (event.target.tagName === 'svg') {
        event.preventDefault();
        hideTooltip();
        if (onContextMenu) onContextMenu(null, event);
      }
    });

    window.addEventListener('resize', () => {
      if (activeMemberId) render(activeMemberId);
    });
  }

  function showTooltip(event, member) {
    tooltip.innerHTML = `
      <div class="font-bold text-base mb-1">${esc(member.nama)}</div>
      <div class="text-xs space-y-0.5">
        ${member.tanggal_lahir ? `<div>${I18n.t('tooltip.birth', member.tanggal_lahir)}</div>` : ''}
        ${member.pekerjaan ? `<div>${I18n.t('tooltip.work', esc(member.pekerjaan))}</div>` : ''}
        ${member.pendidikan ? `<div>${I18n.t('tooltip.education', esc(member.pendidikan))}</div>` : ''}
        ${member.agama ? `<div>${I18n.t('tooltip.religion', esc(member.agama))}</div>` : ''}
        ${member.status_perkawinan ? `<div>${I18n.t('tooltip.marital', esc(member.status_perkawinan))}</div>` : ''}
        ${member.hobi ? `<div>${I18n.t('tooltip.hobby', esc(member.hobi))}</div>` : ''}
        ${member.catatan ? `<div class="mt-1 italic">${esc(member.catatan)}</div>` : ''}
      </div>
    `;
    tooltip.style.display = 'block';

    const contRect = svg.parentElement.getBoundingClientRect();
    const tRect = tooltip.getBoundingClientRect();
    let tx = event.offsetX + 12;
    let ty = event.offsetY - tRect.height / 2;
    const maxX = contRect.width - tRect.width - 5;
    const maxY = contRect.height - tRect.height - 5;
    if (tx > maxX) tx = event.offsetX - tRect.width - 12;
    if (ty < 5) ty = 5;
    if (ty > maxY) ty = maxY;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = 'none';
  }

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function render(memberId) {
    activeMemberId = memberId;
    if (!svg || !memberId) return;

    const members = App.getState().members;
    const active = App.getMember(memberId);
    if (!active) return;

    const rel = App.getRelatives(memberId);

    const visibleIds = new Set();
    visibleIds.add(memberId);

    for (const p of rel.parents) visibleIds.add(p.id);
    for (const s of rel.siblings) visibleIds.add(s.id);
    if (rel.spouse) visibleIds.add(rel.spouse.id);
    for (const c of rel.children) visibleIds.add(c.id);

    const grandparents = [];
    for (const p of rel.parents) {
      const pr = App.getRelatives(p.id);
      for (const gp of pr.parents) {
        if (!visibleIds.has(gp.id)) {
          visibleIds.add(gp.id);
          grandparents.push(gp);
        }
      }
    }

    const allMembers = members.filter(m => visibleIds.has(m.id));

    const svgEl = d3.select(svg);
    g.selectAll('*').remove();

    if (!allMembers.length) return;

    const container = svg.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const nodeW = 110;
    const nodeH = 32;
    const hGap = 10;
    const vGap = 40;
    const levelVGap = 55;

    function getLevel(id) {
      if (id === memberId) return 0;
      if (rel.spouse && id === rel.spouse.id) return 0;
      if (rel.siblings.some(s => s.id === id)) return 0;
      if (rel.parents.some(p => p.id === id)) return -1;
      if (grandparents.some(g => g.id === id)) return -2;
      if (rel.children.some(c => c.id === id)) return 1;
      const m = App.getMember(id);
      if (m && (m.father_id === memberId || m.mother_id === memberId)) return 1;
      return 0;
    }

    const levelMembers = { '-2': [], '-1': [], '0': [], '1': [] };
    for (const m of allMembers) {
      const lvl = getLevel(m.id);
      if (levelMembers[lvl]) levelMembers[lvl].push(m);
    }

    const activeIdxInLevel0 = levelMembers['0'].findIndex(m => m.id === memberId);

    const maxPerLevel = Math.max(
      ...Object.values(levelMembers).map(arr => arr.length)
    );
    const totalLevels = 4;
    const graphW = Math.max(width, maxPerLevel * (nodeW + hGap) + 40);
    const graphH = totalLevels * (nodeH + levelVGap) + 40;

    function getNodeX(m, level) {
      const arr = levelMembers[level] || [];
      const idx = arr.findIndex(x => x.id === m.id);
      if (idx === -1) return 0;
      const totalW = arr.length * (nodeW + hGap) - hGap;
      return (graphW - totalW) / 2 + idx * (nodeW + hGap);
    }

    function getNodeY(level) {
      const centerOffset = (totalLevels - 1) / 2;
      return ((level + 2) - centerOffset) * (nodeH + levelVGap) + 40;
    }

    const links = [];
    for (const m of allMembers) {
      if (m.father_id && visibleIds.has(m.father_id)) {
        links.push({ from: m.father_id, to: m.id });
      }
      if (m.mother_id && visibleIds.has(m.mother_id)) {
        links.push({ from: m.mother_id, to: m.id });
      }
    }
    if (rel.spouse) {
      links.push({ from: memberId, to: rel.spouse.id, dashed: true });
    }

    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodePositions = {};
    for (const m of allMembers) {
      const lvl = getLevel(m.id);
      nodePositions[m.id] = dragPositions[m.id] || {
        x: getNodeX(m, lvl),
        y: getNodeY(lvl)
      };
    }

    linkGroup.selectAll('path')
      .data(links)
      .enter().append('path')
      .attr('d', d => {
        const from = nodePositions[d.from];
        const to = nodePositions[d.to];
        if (!from || !to) return '';
        const x1 = from.x + nodeW / 2;
        const y1 = from.y + nodeH;
        const x2 = to.x + nodeW / 2;
        const y2 = to.y;
        const cy = (y1 + y2) / 2;
        return `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`;
      })
      .attr('fill', 'none')
      .attr('stroke', d => d.dashed ? '#f59e0b' : '#94a3b8')
      .attr('stroke-width', d => d.dashed ? 2 : 1.5)
      .attr('stroke-dasharray', d => d.dashed ? '5,3' : 'none')
      .attr('stroke-opacity', 0.6);

    const nodeGroups = nodeGroup.selectAll('g')
      .data(allMembers)
      .enter().append('g')
      .attr('transform', m => {
        const pos = nodePositions[m.id];
        return `translate(${pos.x},${pos.y})`;
      })
      .style('cursor', 'grab');

    let dragged = false;
    nodeGroups.call(d3.drag()
      .on('start', (event, m) => { dragged = false; })
      .on('drag', (event, m) => {
        dragged = true;
        const pos = nodePositions[m.id];
        if (!pos) return;
        const scale = d3.zoomTransform(svg).k || 1;
        pos.x += event.dx / scale;
        pos.y += event.dy / scale;
        dragPositions[m.id] = { x: pos.x, y: pos.y };
        d3.select(event.sourceEvent.target.closest('g')).attr('transform', `translate(${pos.x},${pos.y})`);

        linkGroup.selectAll('path').attr('d', d => {
          const from = nodePositions[d.from];
          const to = nodePositions[d.to];
          if (!from || !to) return '';
          const x1 = from.x + nodeW / 2;
          const y1 = from.y + nodeH;
          const x2 = to.x + nodeW / 2;
          const y2 = to.y;
          const cy = (y1 + y2) / 2;
          return `M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`;
        });
      })
    );

    nodeGroups.on('click', (event, m) => {
      if (dragged) return;
      event.stopPropagation();
      if (onNodeClick) onNodeClick(m.id);
    })
    .on('contextmenu', (event, m) => {
      event.preventDefault();
      event.stopPropagation();
      hideTooltip();
      if (onContextMenu) onContextMenu(m.id, event);
    })
    .on('mouseover', (event, m) => showTooltip(event, m))
    .on('mouseout', () => hideTooltip());

    nodeGroups.append('rect')
      .attr('width', nodeW)
      .attr('height', nodeH)
      .attr('rx', 6)
      .attr('fill', m => {
        if (m.id === memberId) return '#3b82f6';
        if (rel.spouse && m.id === rel.spouse.id) return '#f59e0b';
        if (rel.parents.some(p => p.id === m.id)) return '#10b981';
        if (grandparents.some(g => g.id === m.id)) return '#34d399';
        if (rel.children.some(c => c.id === m.id)) return '#8b5cf6';
        if (rel.siblings.some(s => s.id === m.id)) return '#06b6d4';
        return '#64748b';
      })
      .attr('stroke', m => {
        if (m.id === memberId) return '#93c5fd';
        if (m._mergedFrom) return '#f97316';
        return '#334155';
      })
      .attr('stroke-width', m => m.id === memberId ? 3 : 1.5)
      .attr('stroke-dasharray', m => m._mergedFrom ? '4,3' : 'none');

    nodeGroups.append('text')
      .attr('x', nodeW / 2)
      .attr('y', m => m._mergedFrom ? nodeH / 2 - 5 : nodeH / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', m => m.id === memberId ? 'bold' : 'normal')
      .text(m => {
        const name = m.nama || '?';
        return name.length > 16 ? name.slice(0, 14) + '..' : name;
      });

    nodeGroups.filter(m => m._mergedFrom)
      .append('text')
      .attr('x', nodeW / 2)
      .attr('y', nodeH - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fb923c')
      .attr('font-size', '7px')
      .attr('font-weight', 'bold')
      .text('MERGED');

    const legendGroup = g.append('g').attr('class', 'legend')
      .attr('transform', `translate(10, 10)`);
    const legendItems = [
      { color: '#3b82f6', label: I18n.t('legend.active') },
      { color: '#10b981', label: I18n.t('legend.parents') },
      { color: '#34d399', label: I18n.t('legend.grandparents') },
      { color: '#06b6d4', label: I18n.t('legend.siblings') },
      { color: '#f59e0b', label: I18n.t('legend.spouse') },
      { color: '#8b5cf6', label: I18n.t('legend.children') },
      { color: '#f97316', label: I18n.t('legend.merged') },
    ];
    legendItems.forEach((item, i) => {
      const ly = i * 18;
      legendGroup.append('rect').attr('x', 0).attr('y', ly)
        .attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', item.color);
      legendGroup.append('text').attr('x', 15).attr('y', ly + 9)
        .attr('fill', '#94a3b8').attr('font-size', '10px').text(item.label);
    });

    const activePos = nodePositions[memberId];
    if (activePos) {
      const targetX = width / 2 - activePos.x - nodeW / 2;
      const targetY = height / 2 - activePos.y - nodeH / 2;
      const svgSelection = d3.select(svg);

      let maxScale = 1;
      const pad = 60;
      const currentGraphW = graphW;
      const currentGraphH = graphH;
      const scaleX = (width - pad * 2) / currentGraphW;
      const scaleY = (height - pad * 2) / currentGraphH;
      maxScale = Math.min(scaleX, scaleY, 1.2);

      const cx = activePos.x + nodeW / 2;
      const cy = activePos.y + nodeH / 2;
      const tx = width / 2 - cx * maxScale;
      const ty = height / 2 - cy * maxScale;

      svgSelection.transition().duration(400).call(
        zoom.transform,
        d3.zoomIdentity.translate(tx, ty).scale(maxScale)
      );
    }

    hideTooltip();
  }

  function centerOn(memberId) {
    render(memberId);
  }

  function searchMembers(query) {
    const members = App.getState().members;
    if (!query.trim()) return [...members];
    const lower = query.toLowerCase();
    return members.filter(m => {
      return Object.values(m).some(v =>
        v && String(v).toLowerCase().includes(lower)
      );
    });
  }

  function refresh() {
    if (activeMemberId) {
      render(activeMemberId);
    } else {
      const members = App.getState().members;
      if (members.length) {
        render(members[0].id);
      } else {
        g.selectAll('*').remove();
      }
    }
  }

  function resetPositions() {
    for (const key in dragPositions) delete dragPositions[key];
    if (activeMemberId) render(activeMemberId);
  }

  return { init, render, centerOn, searchMembers, refresh, hideTooltip, resetPositions };
})();
