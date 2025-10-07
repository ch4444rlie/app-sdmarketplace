import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, 
  Modal, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  TextField,
  Chip,
  Tabs,
  Tab,
  Link
} from '@mui/material';
import { Add as AddIcon, Info as InfoIcon, Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

const App = () => {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [selected, setSelected] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('openSource');

  useEffect(() => {
    setLoading(true);
    axios.get('/tools')
      .then(response => {
        setTools(response.data);
        setFilteredTools(response.data.filter(tool => tool.Type === 'Open-Source'));
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to fetch tools. Ensure backend is running.');
        setLoading(false);
        console.error('Fetch error:', error);
      });
  }, []);

  // Tab and search filter
  useEffect(() => {
    let filtered = tools;
    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      filtered = tools.filter(tool => 
        tool.Name.toLowerCase().includes(query) ||
        tool['Quick One-Liner'].toLowerCase().includes(query) ||
        tool['Best For'].toLowerCase().includes(query)
      );
    } else if (tab === 'openSource') {
      filtered = tools.filter(tool => tool.Type === 'Open-Source');
    } else {
      filtered = tools.filter(tool => tool.Type === 'Proprietary');
    }
    setFilteredTools(filtered);
  }, [tab, searchQuery, tools]);

  const columns = [
    { 
      field: 'Logo', 
      headerName: 'Logo', 
      width: 100, 
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <img 
          src={params.value || 'https://via.placeholder.com/64?text=Logo'} 
          alt="Logo" 
          style={{ width: 48, height: 48, objectFit: 'contain' }} 
        />
      )
    },
    { 
      field: 'Name', 
      headerName: 'Name', 
      width: 220,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <div>
          <Typography variant="body2" fontWeight="bold">{params.row.Name}</Typography>
          <Typography variant="caption" color="textSecondary">Rank: {params.row.Rank}</Typography>
        </div>
      )
    },
    { 
      field: 'Quick One-Liner', 
      headerName: 'Description', 
      width: 400, 
      minWidth: 350,
      flex: 2 
    },
    { 
      field: 'Popularity', 
      headerName: 'Popularity', 
      width: 200, 
      minWidth: 180,
      flex: 1 
    },
    { 
      field: 'Best For', 
      headerName: 'Best For', 
      width: 220, 
      minWidth: 200,
      flex: 1 
    },
    { 
      field: 'Price', 
      headerName: 'Price', 
      width: 160,
      minWidth: 150,
      flex: 0.8,
      valueGetter: (params) => params.row.Price || 'Free (Open-Source)'
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 160,
      minWidth: 150,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              if (selected.length < 3 && !selected.some(s => s.Name === params.row.Name)) {
                setSelected([...selected, params.row]);
              }
            }}
            disabled={selected.length >= 3 || selected.some(s => s.Name === params.row.Name)}
          >
            Add
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<InfoIcon />}
            onClick={() => {
              setSelectedTool(params.row);
              setDetailsOpen(true);
            }}
          >
            Info
          </Button>
        </Box>
      )
    }
  ];

  const handleCompare = () => {
    if (selected.length >= 2) {
      setCompareOpen(true);
    }
  };

  const removeFromComparison = (toolName) => {
    setSelected(selected.filter(s => s.Name !== toolName));
  };

  if (loading) {
    return (
      <Box sx={{ padding: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading tools...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Marketplace for Synthetic Data Tools
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search tools..."
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, description, or best for"
        />
      </Box>

      {/* Compare Button and Selected Tools Chips */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          disabled={selected.length < 2} 
          onClick={handleCompare}
        >
          Compare ({selected.length}/3)
        </Button>
        {selected.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selected.map((tool) => (
              <Chip
                key={tool.Name}
                label={tool.Name}
                onDelete={() => removeFromComparison(tool.Name)}
                color="primary"
                deleteIcon={<CloseIcon />}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={searchQuery ? false : tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Open-Source" value="openSource" />
        <Tab label="Proprietary" value="proprietary" />
      </Tabs>

      {/* DataGrid Table */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTools}
          columns={columns}
          pagination={false}
          getRowId={(row) => row.Name}
          disableRowSelectionOnClick
          disableColumnMenu
        />
      </div>

      {/* Details Modal */}
      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 600, 
          bgcolor: 'background.paper', 
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '85vh',
          overflow: 'auto'
        }}>
          {selectedTool && (
            <>
              <Typography variant="h5" gutterBottom>{selectedTool.Name}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Rank: {selectedTool.Rank} | Type: {selectedTool.Type}
              </Typography>

              {/* Documentation and Download Links */}
              <Box sx={{ mt: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {selectedTool.Documentation && selectedTool.Documentation !== 'unavailable' ? (
                  <Link 
                    href={selectedTool.Documentation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Typography variant="body2" fontWeight="bold">Documentation</Typography>
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                ) : (
                  <Typography variant="body2" fontWeight="bold" color="text.disabled">
                    Documentation (unavailable)
                  </Typography>
                )}
                {selectedTool['Download Link'] && selectedTool['Download Link'] !== 'unavailable' ? (
                  <Link 
                    href={selectedTool['Download Link']} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Typography variant="body2" fontWeight="bold">Download / Get Started</Typography>
                    <OpenInNewIcon fontSize="small" />
                  </Link>
                ) : (
                  <Typography variant="body2" fontWeight="bold" color="text.disabled">
                    Download / Get Started (unavailable)
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Description:</Typography>
                <Typography variant="body2" paragraph>{selectedTool['Quick One-Liner']}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Key Features:</Typography>
                <Typography variant="body2" paragraph>{selectedTool['Key Features']}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Pros:</Typography>
                <Typography variant="body2" paragraph>{selectedTool.Pros}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Cons:</Typography>
                <Typography variant="body2" paragraph>{selectedTool.Cons}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Best For:</Typography>
                <Typography variant="body2" paragraph>{selectedTool['Best For']}</Typography>
                
                <Typography variant="subtitle1" fontWeight="bold">Popularity:</Typography>
                <Typography variant="body2" paragraph>{selectedTool.Popularity}</Typography>
                
                {selectedTool.Price && (
                  <>
                    <Typography variant="subtitle1" fontWeight="bold">Price:</Typography>
                    <Typography variant="body2">{selectedTool.Price}</Typography>
                  </>
                )}
              </Box>
              <Button onClick={() => setDetailsOpen(false)} variant="contained" sx={{ mt: 3 }}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* Comparison Modal */}
      <Modal open={compareOpen} onClose={() => setCompareOpen(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '80%', 
          maxWidth: 900, 
          bgcolor: 'background.paper', 
          boxShadow: 24,
          p: 4,
          maxHeight: '80vh',
          overflow: 'auto',
          borderRadius: 2
        }}>
          <Typography variant="h5" gutterBottom>Tool Comparison</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Attribute</strong></TableCell>
                {selected.map((tool) => (
                  <TableCell key={tool.Name}>
                    <strong>{tool.Name}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><strong>Logo</strong></TableCell>
                {selected.map((tool) => (
                  <TableCell key={tool.Name}>
                    <img 
                      src={tool.Logo || 'https://via.placeholder.com/64?text=Logo'} 
                      alt={`${tool.Name} Logo`} 
                      style={{ width: 48, height: 48, objectFit: 'contain' }} 
                    />
                  </TableCell>
                ))}
              </TableRow>
              {['Type', 'Quick One-Liner', 'Key Features', 'Pros', 'Cons', 'Popularity', 'Best For', 'Price'].map((attr) => (
                <TableRow key={attr}>
                  <TableCell><strong>{attr}</strong></TableCell>
                  {selected.map((tool) => (
                    <TableCell key={tool.Name}>
                      {tool[attr] || (attr === 'Price' ? 'Free (Open-Source)' : 'N/A')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={() => setCompareOpen(false)} variant="contained" sx={{ mt: 3 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default App;